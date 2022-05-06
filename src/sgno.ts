import { Transfer } from "../generated-gc/ds-sgno/ERC20";
import {
  loadOrCreate as loadOrCreateUser,
  saveOrRemove as saveOrRemoveUser,
} from "./helpers/user";

import { ADDRESS_ZERO } from "./constants";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = loadOrCreateUser(from);
    userFrom.sgno = userFrom.sgno.minus(event.params.value);
    userFrom.voteWeight = userFrom.voteWeight.minus(event.params.value);
    saveOrRemoveUser(userFrom);
  }

  if (to.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userTo = loadOrCreateUser(to);
    userTo.sgno = userTo.sgno.plus(event.params.value);
    userTo.voteWeight = userTo.voteWeight.plus(event.params.value);
    userTo.save();
  }
}
