import { BigInt, store } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/ds-lgno/LGNO";
import { loadOrCreateUser, removeOrSaveUser, ADDRESS_ZERO } from "./helpers";

export function handleTransfer(event: Transfer): void {
  // note to and from are flipped because of an error in the contract implementation

  const from = event.params.to;
  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = loadOrCreateUser(from);
    userFrom.lgno = userFrom.lgno.minus(event.params.value);
    userFrom.voteWeight = userFrom.voteWeight.minus(event.params.value);
    removeOrSaveUser(userFrom.id);
  }

  const to = event.params.from;
  if (to.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userTo = loadOrCreateUser(to);
    userTo.lgno = userTo.lgno.plus(event.params.value);
    userTo.voteWeight = userTo.voteWeight.plus(event.params.value);
    userTo.save();
  }
}
