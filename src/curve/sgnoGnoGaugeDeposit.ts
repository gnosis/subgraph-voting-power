import { Transfer } from "../../generated-gc/ds-curve-sgno-gno-gauge-deposit/ERC20";

import { ADDRESS_ZERO } from "../constants";
import { User, WeightedPool } from "../../generated/schema";
import { SGNO_GNO_POOL_ADDRESS } from "./sgnoGno";
import { handleTransfer as handleTransferForWeightedPool } from "../helpers/weightedPool";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;
  const value = event.params.value;

  // We treat deposit token transfers just like LP token transfers, meaning the the user's WeightedPoolPositions will stay intact when staking.
  // This is important so we can iterate over all sGNO/GNO LPs. (There's no way to iterate over all users.)
  handleTransferForWeightedPool(
    SGNO_GNO_POOL_ADDRESS,

    // For deposit token burns and mints, we must update the addresses since passing ZERO addresses would affect the LP token's total supply
    from.equals(ADDRESS_ZERO) ? event.address : from,
    to.equals(ADDRESS_ZERO) ? event.address : to,

    value
  );

  const pool = loadSgnoGnoPool();
  const transferredGnoValue = value
    .times(pool.gnoBalance)
    .div(pool.totalSupply);

  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = User.load(from.toHexString());
    if (userFrom) {
      userFrom.stakedGnoSgno = userFrom.stakedGnoSgno.minus(
        transferredGnoValue
      );
    }
  }

  if (to.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userTo = User.load(to.toHexString());
    if (userTo) {
      userTo.stakedGnoSgno = userTo.stakedGnoSgno.plus(transferredGnoValue);
      userTo.save();
    }
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