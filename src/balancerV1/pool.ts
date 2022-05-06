import {
  LOG_JOIN,
  LOG_EXIT,
  LOG_SWAP,
  Transfer,
} from "../../generated-gc/templates/BalancerV1Pool/Pool";

import {
  GNO_ADDRESS,
  loadPool,
  weightedPoolSwap,
  weightedPoolTransfer,
  ZERO_BI,
} from "../helpers";

/************************************
 ********** JOINS & EXITS ***********
 ************************************/

export function handleJoinPool(event: LOG_JOIN): void {
  const pool = loadPool(event.address);

  if (pool && event.params.tokenIn.equals(GNO_ADDRESS)) {
    pool.gnoBalance = pool.gnoBalance.plus(event.params.tokenAmountIn);
    pool.save();
  }
}

export function handleExitPool(event: LOG_EXIT): void {
  const pool = loadPool(event.address);

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

  const pool = loadPool(event.address);
  if (!pool) {
    return;
  }

  pool.gnoBalance = pool.gnoBalance.plus(gnoIn).minus(gnoOut);
  pool.save();
  weightedPoolSwap(pool, gnoIn, gnoOut);
}

/************************************
 *********** POOL SHARES ************
 ************************************/

export function handleTransfer(event: Transfer): void {
  const from = event.params.src;
  const to = event.params.dst;
  const value = event.params.amt;

  weightedPoolTransfer(event, from, to, value);
}
