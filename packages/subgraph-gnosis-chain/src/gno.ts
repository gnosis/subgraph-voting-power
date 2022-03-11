import {
  Address,
  Bytes,
  BigInt,
  store,
  ethereum,
} from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/ds-gno/GNO";
import { loadOrCreateUser, ADDRESS_ZERO } from "./helpers";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = loadOrCreateUser(from);
    userFrom.gno = userFrom.gno.minus(event.params.value);
    userFrom.voteWeight = userFrom.voteWeight.minus(event.params.value);
    if (userFrom.voteWeight == BigInt.fromI32(0)) {
      store.remove("User", userFrom.id);
    } else {
      userFrom.save();
    }
  }

  if (to.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userTo = loadOrCreateUser(to);
    userTo.gno = userTo.gno.plus(event.params.value);
    userTo.voteWeight = userTo.voteWeight.plus(event.params.value);
    userTo.save();
  }
}
