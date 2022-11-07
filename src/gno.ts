import { Transfer } from "../generated/ds-gno/ERC20";
import {
  loadOrCreate as loadOrCreateUser,
  saveOrRemove as saveOrRemoveUser,
} from "./helpers/user";

import { ADDRESS_ZERO, ZERO_BI } from "./constants";
import { MGNO_PER_GNO, WRAPPER_ADDRESS } from "./mgno";
import { PendingMgnoBalance } from "../generated/schema";
import { Address, Bytes, log } from "@graphprotocol/graph-ts";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = loadOrCreateUser(from);
    userFrom.gno = userFrom.gno.minus(event.params.value);
    userFrom.voteWeight = userFrom.voteWeight.minus(event.params.value);
    saveOrRemoveUser(userFrom);
  }

  if (
    to.toHexString() != ADDRESS_ZERO.toHexString() &&
    to.toHexString() != WRAPPER_ADDRESS.toHexString()
  ) {
    const userTo = loadOrCreateUser(to);
    userTo.gno = userTo.gno.plus(event.params.value);
    userTo.voteWeight = userTo.voteWeight.plus(event.params.value);
    userTo.save();
  }

  // transfer to SBCWrapper: keep track of pending mgno balance
  if (to.toHexString() == WRAPPER_ADDRESS.toHexString()) {
    const pendingMgnoBalance = loadOrCreatePendingMgnoBalance(
      event.transaction.hash,
      from
    );
    pendingMgnoBalance.user = from.toHexString();
    pendingMgnoBalance.balance = pendingMgnoBalance.balance.plus(
      event.params.value.times(MGNO_PER_GNO)
    );
    pendingMgnoBalance.save();
    log.info("Pending mgno balance {} of user {} updated to {}", [
      pendingMgnoBalance.id,
      pendingMgnoBalance.user,
      pendingMgnoBalance.balance.toString(),
    ]);
  }
}

function loadOrCreatePendingMgnoBalance(
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
    pendingBalance = new PendingMgnoBalance(
      txHash.toHexString() + "-" + increment.toString()
    );
    pendingBalance.user = userId;
    pendingBalance.balance = ZERO_BI;
  }

  return pendingBalance;
}
