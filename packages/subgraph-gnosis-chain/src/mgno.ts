import { BigInt, store } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/ds-mgno/MGNO";
import {
  loadOrCreateUser,
  ADDRESS_ZERO,
  DEPOSIT_ADDRESS,
  mgnoPerGno,
} from "./helpers";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;
  const value = event.params.value;

  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = loadOrCreateUser(from);
    userFrom.mgno = userFrom.mgno.minus(value);
    if (to.toHexString() == DEPOSIT_ADDRESS.toHexString()) {
      userFrom.deposit = userFrom.deposit.plus(value.div(mgnoPerGno));
    } else {
      userFrom.voteWeight = userFrom.voteWeight.minus(value.div(mgnoPerGno));
    }
    if (userFrom.voteWeight == BigInt.fromI32(0)) {
      store.remove("User", userFrom.id);
    } else {
      userFrom.save();
    }
  }

  if (
    to.toHexString() != ADDRESS_ZERO.toHexString() &&
    to.toHexString() != DEPOSIT_ADDRESS.toHexString()
  ) {
    const userTo = loadOrCreateUser(to);
    userTo.mgno = userTo.mgno.plus(value);
    userTo.voteWeight = userTo.voteWeight.plus(value.div(mgnoPerGno));
    userTo.save();
  }
}
