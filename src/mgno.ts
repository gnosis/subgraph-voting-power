import { Address, BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated-gc/ds-mgno/ERC20";

import {
  loadOrCreate as loadOrCreateUser,
  saveOrRemove as saveOrRemoveUser,
} from "./helpers/user";

import { ADDRESS_ZERO, ZERO_BI } from "./constants";
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
    // MGNO transfer out of SBCWrapper: we need to clear out the corresponding pending MGNO balance
    userToCredit = deductFromPendingMgnoBalance(
      event.transaction.hash,
      to,
      valueInMgno
    );
  }

  if (
    to.toHexString() != ADDRESS_ZERO.toHexString() &&
    to.toHexString() != DEPOSIT_ADDRESS.toHexString()
  ) {
    if (!userToCredit) {
      userToCredit = loadOrCreateUser(to);
    }

    // transfer to user's wallet: credit user with MGNO
    userToCredit.mgno = userToCredit.mgno.plus(valueInMgno);
    userToCredit.voteWeight = userToCredit.voteWeight.plus(valueInGno);
    userToCredit.save();
  }

  if (to.toHexString() == DEPOSIT_ADDRESS.toHexString()) {
    if (!userToCredit) {
      log.warning(
        "No user with pending MGNO balance found to credit for deposit, using transfer.from {}",
        [from.toHexString()]
      );
      userToCredit = loadOrCreateUser(from);
    }

    // transfer to SBCDeposit contract: credit user with deposit
    userToCredit.deposit = userToCredit.deposit.plus(valueInGno);
    userToCredit.voteWeight = userToCredit.voteWeight.plus(valueInGno);
    userToCredit.save();
  }
}

function loadPendingMgnoBalance(
  txHash: Bytes,
  user: Address
): PendingMgnoBalance | null {
  const userId = user.toHexString();
  let increment = -1;
  let pendingBalance: PendingMgnoBalance | null = null;
  do {
    increment++;
    pendingBalance = PendingMgnoBalance.load(
      txHash.toHexString() + "-" + increment.toString()
    );
  } while (!!pendingBalance && pendingBalance.user != userId);

  return pendingBalance;
}

function deductFrom(
  balance: PendingMgnoBalance,
  valueToDeduct: BigInt
): BigInt {
  if (valueToDeduct.gt(balance.balance)) {
    valueToDeduct = valueToDeduct.minus(balance.balance);
    balance.balance = ZERO_BI;
  } else {
    balance.balance = balance.balance.minus(valueToDeduct);
    valueToDeduct = ZERO_BI;
  }
  saveOrRemovePendingMgnoBalance(balance);
  return valueToDeduct;
}

// Returns the user that should be credited with the deposit
function deductFromPendingMgnoBalance(
  txHash: Bytes,
  to: Address,
  valueToDeduct: BigInt
): User {
  if (to.toHexString() != DEPOSIT_ADDRESS.toHexString()) {
    // mGNO recipient is not the deposit contract, so we try to find a pending balance for the recipient (assuming that sender = recipient in simple swap)
    const pendingMgnoBalance = loadPendingMgnoBalance(txHash, to);
    if (!!pendingMgnoBalance) {
      valueToDeduct = deductFrom(pendingMgnoBalance, valueToDeduct);
    }
  }

  if (valueToDeduct == ZERO_BI) {
    return loadOrCreateUser(to);
  }

  // try to find a pending balance that can entirely cover the value to deduct
  let increment = -1;
  let pendingBalance: PendingMgnoBalance | null = null;
  do {
    increment++;
    pendingBalance = PendingMgnoBalance.load(
      txHash.toHexString() + "-" + increment.toString()
    );
  } while (!!pendingBalance && valueToDeduct.gt(pendingBalance.balance));
  if (!!pendingBalance) {
    deductFrom(pendingBalance, valueToDeduct);
    return loadOrCreateUser(
      to.toHexString() == DEPOSIT_ADDRESS.toHexString()
        ? Address.fromString(pendingBalance.user)
        : to
    );
  }

  // could not find a single user's balance that can entirely cover the value to deduct
  // so we spread it out over multiple users and return the last user that was credited :S (this should never happen in practice)
  log.warning(
    "Could not find a single pending MGNO balance large enough to cover an outgoing transfer in {}",
    [txHash.toHexString()]
  );
  increment = -1;
  pendingBalance = null;
  let userWithPendingBalance: string | null = null;
  do {
    increment++;
    pendingBalance = PendingMgnoBalance.load(
      txHash.toHexString() + "-" + increment.toString()
    );
    if (!!pendingBalance) {
      deductFrom(pendingBalance, valueToDeduct);
      userWithPendingBalance = pendingBalance.user;
    }
  } while (!!pendingBalance && valueToDeduct.gt(ZERO_BI));
  if (valueToDeduct.gt(ZERO_BI)) {
    throw new Error(
      `Could not find enough pending MGNO balances to cover an outgoing transfer in ${txHash.toHexString()}`
    );
  }

  const userToCredit =
    to.toHexString() == DEPOSIT_ADDRESS.toHexString()
      ? Address.fromString(
          userWithPendingBalance == null
            ? ADDRESS_ZERO.toHexString()
            : (userWithPendingBalance as string)
        )
      : to;

  if (userToCredit.toHexString() == ADDRESS_ZERO.toHexString()) {
    throw new Error(
      `Could not find a user to credit for deposit in transaction ${txHash.toHexString()}`
    );
  }

  return loadOrCreateUser(userToCredit);
}

function saveOrRemovePendingMgnoBalance(balance: PendingMgnoBalance): void {
  if (balance.balance.isZero()) {
    store.remove("PendingMgnoBalance", balance.id);
    log.info("removed PendingMgnoBalance {}", [balance.id]);
  } else {
    balance.save();
  }
}
