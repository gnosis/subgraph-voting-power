import { Address, log, Bytes } from "@graphprotocol/graph-ts";
import {
  InternalBalanceChanged,
  PoolBalanceChanged,
  Swap,
} from "../../generated/ds-balancer-v2-vault/Vault";

import { WeightedPool } from "../../generated/schema";

import {
  GNO_ADDRESS,
  loadOrCreateUser,
  removeOrSaveUser,
  weightedPoolSwap,
  ZERO_BI,
} from "../helpers";

export function handleSwap(event: Swap): void {
  // swaps don't change LP token total supply, but they might change the GNO reserves
  const gnoIn = event.params.tokenIn.equals(GNO_ADDRESS)
    ? event.params.amountIn
    : ZERO_BI;
  const gnoOut = event.params.tokenOut.equals(GNO_ADDRESS)
    ? event.params.amountOut
    : ZERO_BI;

  if (gnoIn.equals(ZERO_BI) && gnoOut.equals(ZERO_BI)) {
    // no change in GNO reserves
    return;
  }

  const pool = loadWeightedPool(event.params.poolId);

  pool.gnoBalance = pool.gnoBalance.plus(gnoIn).minus(gnoOut);
  pool.save();
  weightedPoolSwap(pool, gnoIn, gnoOut);
}

export function handleBalanceChange(event: PoolBalanceChanged): void {
  const index = event.params.tokens.findIndex(t => t.equals(GNO_ADDRESS));
  if (index == -1) {
    return;
  }

  const delta = event.params.deltas[index];
  const pool = loadWeightedPool(event.params.poolId);
  pool.gnoBalance = pool.gnoBalance.plus(delta);
  pool.save();
}

export function handleInternalBalanceChange(
  event: InternalBalanceChanged
): void {
  if (event.params.token.equals(GNO_ADDRESS)) {
    const user = loadOrCreateUser(event.params.user);
    user.balancerInternalGno = user.balancerInternalGno.plus(
      event.params.delta
    );
    user.voteWeight = user.voteWeight.plus(event.params.delta);
    removeOrSaveUser(user);
  }
}

function loadWeightedPool(poolId: Bytes): WeightedPool {
  const address = getPoolAddress(poolId);
  const pool = WeightedPool.load(address.toHexString());
  if (!pool)
    throw new Error(`WeightedPool with id ${address.toHexString()} not found`);
  return pool;
}

function getPoolAddress(poolId: Bytes): Address {
  // balancer pool id's are generated like this:
  // serialized |= bytes32(uint256(nonce));
  // serialized |= bytes32(uint256(specialization)) << (10 * 8);
  // serialized |= bytes32(uint256(pool)) << (12 * 8);
  return Address.fromString(poolId.toHexString().slice(0, 42));
}
