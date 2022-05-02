import { log } from "@graphprotocol/graph-ts";
import {
  LOG_JOIN,
  LOG_EXIT,
  LOG_SWAP,
  Transfer,
} from "../../generated-gc/templates/BalancerV1Pool/Pool";

import { WeightedPool } from "../../generated/schema";

import {
  GNO_ADDRESS,
  weightedPoolSwap,
  weightedPoolTransfer,
  ZERO_BI,
} from "../helpers";

/************************************
 ********** JOINS & EXITS ***********
 ************************************/

export function handleJoinPool(event: LOG_JOIN): void {
  const id = event.address.toHexString();
  const pool = WeightedPool.load(id);
  if (!pool) {
    log.warning(
      "Weighted pool with id {} could not be loaded. Trying to handle {}#{}",
      [
        id,
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }

  if (event.params.tokenIn.equals(GNO_ADDRESS)) {
    pool.gnoBalance = pool.gnoBalance.plus(event.params.tokenAmountIn);
    pool.save();
  }
}

export function handleExitPool(event: LOG_EXIT): void {
  const id = event.address.toHexString();
  const pool = WeightedPool.load(id);
  if (!pool) {
    log.warning(
      "Weighted pool with id {} could not be loaded. Trying to handle {}#{}",
      [
        id,
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }

  if (event.params.tokenOut.equals(GNO_ADDRESS)) {
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
