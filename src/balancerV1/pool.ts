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
  const pool = loadPool(event, event.address);

  if (pool && event.params.tokenIn.equals(GNO_ADDRESS)) {
    pool.gnoBalance = pool.gnoBalance.plus(event.params.tokenAmountIn);
    pool.save();
  }
}

export function handleExitPool(event: LOG_EXIT): void {
  const pool = loadPool(event, event.address);

  if (pool && event.params.tokenOut.equals(GNO_ADDRESS)) {
    pool.gnoBalance = pool.gnoBalance.minus(event.params.tokenAmountOut);
    pool.save();
  }
}

/************************************
 ************** SWAPS ***************
 ************************************/

export function handleSwap(event: LOG_SWAP): void {
  const id = event.address.toHexString();
  let gnoIn = ZERO_BI;
  let gnoOut = ZERO_BI;

  if (event.params.tokenIn.equals(GNO_ADDRESS)) {
    gnoIn = event.params.tokenAmountIn;
  }

  if (event.params.tokenOut.equals(GNO_ADDRESS)) {
    gnoOut = event.params.tokenAmountOut;
  }

  if (!gnoIn.equals(ZERO_BI) || !gnoOut.equals(ZERO_BI)) {
    const pool = loadPool(event, event.address);
    if (!pool) return;
    pool.gnoBalance = pool.gnoBalance.plus(gnoIn).minus(gnoOut);
    weightedPoolSwap(event, id, gnoIn, gnoOut);
  }
}

/************************************
 *********** POOL SHARES ************
 ************************************/

export function handleTransfer(event: Transfer): void {
  const id = event.address.toHex();

  const from = event.params.src;
  const to = event.params.dst;

  weightedPoolTransfer(event, id, from, to, event.params.amt);
}
