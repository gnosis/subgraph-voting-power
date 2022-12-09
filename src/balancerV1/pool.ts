import {
  LOG_JOIN,
  LOG_EXIT,
  LOG_SWAP,
  LOG_CALL,
  Transfer,
} from "../../generated-gc/templates/BalancerV1Pool/Pool";

import {
  loadPool as loadWeightedPool,
  handleSwap as handleSwapForWeightedPool,
  handleTransfer as handleTransferForWeightedPool,
  handleBalanceChange as handleBalanceChangeForWeightedPool,
} from "../helpers/weightedPool";

import { GNO_ADDRESS, ZERO_BI } from "../constants";
import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { WeightedPool } from "../../generated/schema";

/************************************
 ********** JOINS & EXITS ***********
 ************************************/

export function handleJoinPool(event: LOG_JOIN): void {
  const pool = loadWeightedPool(event.address);

  if (event.params.tokenIn.equals(GNO_ADDRESS)) {
    pool.gnoBalance = pool.gnoBalance.plus(event.params.tokenAmountIn);
    pool.save();
  }
}

export function handleExitPool(event: LOG_EXIT): void {
  const pool = loadWeightedPool(event.address);

  if (pool && event.params.tokenOut.equals(GNO_ADDRESS)) {
    pool.gnoBalance = pool.gnoBalance.minus(event.params.tokenAmountOut);
    pool.save();
  }
}

/************************************
 ************** SWAPS ***************
 ************************************/

export function handleSwap(event: LOG_SWAP): void {
  const gnoIn = event.params.tokenIn.equals(GNO_ADDRESS)
    ? event.params.tokenAmountIn
    : ZERO_BI;
  const gnoOut = event.params.tokenOut.equals(GNO_ADDRESS)
    ? event.params.tokenAmountOut
    : ZERO_BI;

  if (gnoIn.equals(ZERO_BI) && gnoOut.equals(ZERO_BI)) {
    // no change in GNO reserves
    return;
  }

  const pool = loadWeightedPool(event.address);

  pool.gnoBalance = pool.gnoBalance.plus(gnoIn).minus(gnoOut);
  pool.save();

  handleSwapForWeightedPool(pool, gnoIn, gnoOut);
}

/************************************
 *********** POOL SHARES ************
 ************************************/

export function handleTransfer(event: Transfer): void {
  const from = event.params.src;
  const to = event.params.dst;
  const value = event.params.amt;

  handleTransferForWeightedPool(event, from, to, value);
}

export function handleRebind(event: LOG_CALL): void {
  const poolId = event.address.toHex();
  const pool = WeightedPool.load(poolId);
  if (!pool) {
    return;
  }

  const tokenAddress = Address.fromString(
    event.params.data.toHexString().slice(34, 74)
  );

  if (!tokenAddress.equals(GNO_ADDRESS)) {
    return;
  }

  const nextGnoBalance = hexToBigInt(
    event.params.data.toHexString().slice(74, 138)
  );

  handleBalanceChangeForWeightedPool(pool, nextGnoBalance);
  pool.gnoBalance = nextGnoBalance;
  pool.save();
}

export function hexToBigInt(hexString: string): BigInt {
  let bytes = Bytes.fromHexString(hexString).reverse() as Bytes;
  return BigInt.fromUnsignedBytes(bytes);
}
