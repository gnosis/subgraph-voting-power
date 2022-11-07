import { Address, BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated-gc/ds-mgno/ERC20";

import {
  loadOrCreate as loadOrCreateUser,
  saveOrRemove as saveOrRemoveUser,
} from "./helpers/user";

import { ADDRESS_ZERO } from "./constants";
import { PendingMgnoBalance, User } from "../generated/schema";

export const WRAPPER_ADDRESS = Address.fromString(
  "0x647507A70Ff598F386CB96ae5046486389368C66"
);

export const DEPOSIT_ADDRESS = Address.fromString(
  "0x0B98057eA310F4d31F2a452B414647007d1645d9"
);

export const MGNO_PER_GNO = BigInt.fromString("32");

// We need to take into account two special accounts:
//   - the SBCWrapper contract for swapping GNO to mGNO
//   - the SBCDeposit contract for depositing mGNO for funding validators.
//
// There are these different scenarios of mGNO transfers that we need to handle:
//   - mGNO is transferred between regular user accounts
//   - mGNO is transferred from a user account to the SBCDeposit contract
//   - GNO is transferred from a user account to SBCWrapper, swapped to mGNO which is sent from SBCWrapper to SBCDeposit
//
// For this third scenario, we need to keep track of the pending GNO balances that users sent to SBCWrapper and we associate these with mGNO transfers out of SBCWrapper in the same transaction.
export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;
  const valueInMgno = event.params.value;
  const valueInGno = valueInMgno.div(MGNO_PER_GNO);

  if (
    from.toHexString() != ADDRESS_ZERO.toHexString() &&
    from.toHexString() != WRAPPER_ADDRESS.toHexString()
  ) {
    const userFrom = loadOrCreateUser(from);
    userFrom.mgno = userFrom.mgno.minus(valueInMgno);
    userFrom.voteWeight = userFrom.voteWeight.minus(valueInGno);
    saveOrRemoveUser(userFrom);
  }

  let userToCredit: User | null = null;

  if (from.toHexString() == WRAPPER_ADDRESS.toHexString()) {
    // MGNO transfer out of SBCWrapper: we need to clear out a pending MGNO balance

    if (to.toHexString() == DEPOSIT_ADDRESS.toHexString()) {
      // `to` is deposit contract address, so we start crediting deposits to users with pending MGNO balances in this transaction
      userToCredit = deductFromPendingMgnoBalance(
        event.transaction.hash,
        valueInMgno
      );
    } else {
      // `to` is the user's address, we clear out that user's pending MGNO balance
      const pendingMgnoBalance = loadPendingMgnoBalance(
        event.transaction.hash,
        to
      );
      pendingMgnoBalance.balance = pendingMgnoBalance.balance.minus(
        valueInMgno
      );
      if (pendingMgnoBalance.balance.lt(BigInt.fromI32(0))) {
        throw new Error(
          `Negative pending MGNO balance for user ${
            pendingMgnoBalance.user
          } in transaction ${event.transaction.hash.toHexString()}`
        );
      }
      saveOrRemovePendingMgnoBalance(pendingMgnoBalance);
    }
  }

  if (!userToCredit) {
    userToCredit = loadOrCreateUser(
      to.toHexString() == DEPOSIT_ADDRESS.toHexString() ? from : to
    );
  }

  if (
    to.toHexString() != ADDRESS_ZERO.toHexString() &&
    to.toHexString() != DEPOSIT_ADDRESS.toHexString()
  ) {
    // transfer to user's wallet: credit user with MGNO
    userToCredit.mgno = userToCredit.mgno.plus(valueInMgno);
    userToCredit.voteWeight = userToCredit.voteWeight.plus(valueInGno);
    userToCredit.save();
  }

  if (to.toHexString() == DEPOSIT_ADDRESS.toHexString()) {
    // transfer to SBCDeposit contract: credit user with deposit
    userToCredit.deposit = userToCredit.deposit.plus(valueInGno);
    userToCredit.voteWeight = userToCredit.voteWeight.plus(valueInGno);
    userToCredit.save();
  }
}

function loadPendingMgnoBalance(
  txHash: Bytes,
  user: Address
): PendingMgnoBalance {
  const userId = user.toHexString();
  let increment = -1;
  let pendingBalance: PendingMgnoBalance | null;
  do {
    increment++;
    pendingBalance = PendingMgnoBalance.load(
      txHash.toHexString() + "-" + increment.toString()
    );
  } while (!!pendingBalance && pendingBalance.user != userId);

  if (!pendingBalance) {
    throw new Error(
      `Expected to find a pending MGNO balance for user ${userId} in transaction ${txHash.toHexString()}`
    );
  }

  return pendingBalance;
}

// Returns the user that should be credited with the deposit
function deductFromPendingMgnoBalance(txHash: Bytes, value: BigInt): User {
  let increment = -1;
  let pendingBalance: PendingMgnoBalance | null;
  do {
    increment++;
    pendingBalance = PendingMgnoBalance.load(
      txHash.toHexString() + "-" + increment.toString()
    );
  } while (!!pendingBalance && pendingBalance.balance.lt(value));

  if (!pendingBalance) {
    throw new Error(
      `Found no pending MGNO balance to credit with a deposit of ${value.toString()} in ${txHash.toHexString()}`
    );
  }

  pendingBalance.balance = pendingBalance.balance.minus(value);
  saveOrRemovePendingMgnoBalance(pendingBalance);

  return loadOrCreateUser(Address.fromString(pendingBalance.user));
}

function saveOrRemovePendingMgnoBalance(balance: PendingMgnoBalance): void {
  if ((balance.balance = BigInt.fromI32(0))) {
    store.remove("PendingMgnoBalance", balance.id);
    log.info("removed PendingMgnoBalance {}", [balance.id]);
  } else {
    balance.save();
  }
}
