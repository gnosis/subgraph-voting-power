import { Transfer } from "../../generated-gc/ds-curve-sgno-gno-gauge-deposit/ERC20";
import {
  loadOrCreate as loadOrCreateUser,
  saveOrRemove as saveOrRemoveUser,
} from "../helpers/user";

import { ADDRESS_ZERO } from "../constants";
import { WeightedPool } from "../../generated/schema";
import { SGNO_GNO_POOL_ADDRESS } from "./sgnoGno";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  // gauge deposit tokens are issues in a ratio of 1:1 to the LP tokens
  const pool = loadSgnoGnoPool();
  const transferredGnoValue = pool.gnoBalance
    .times(event.params.value)
    .div(pool.totalSupply);

  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = loadOrCreateUser(from);
    userFrom.stakedGnoSgno = userFrom.stakedGnoSgno.minus(transferredGnoValue);
    userFrom.voteWeight = userFrom.voteWeight.minus(transferredGnoValue);
    saveOrRemoveUser(userFrom);
  }

  if (to.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userTo = loadOrCreateUser(to);
    userTo.stakedGnoSgno = userTo.stakedGnoSgno.plus(transferredGnoValue);
    userTo.voteWeight = userTo.voteWeight.plus(transferredGnoValue);
    userTo.save();
  }
}

function loadSgnoGnoPool(): WeightedPool {
  const id = SGNO_GNO_POOL_ADDRESS.toHexString();
  let pool = WeightedPool.load(id);
  if (!pool) {
    throw new Error("No WeightedPool instance found for SGNO/GNO Curve pool");
  }
  return pool;
}
