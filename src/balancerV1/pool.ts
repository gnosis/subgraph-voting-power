import { BigInt, log, Address, Bytes, store } from "@graphprotocol/graph-ts";
import {
  LOG_CALL,
  LOG_JOIN,
  LOG_EXIT,
  LOG_SWAP,
  Transfer,
  GulpCall,
} from "../../generated-gc/templates/BalancerV1Pool/Pool";

// import {
//   Symmetric,
//   Pool,
//   PoolToken,
//   PoolShare,
//   Swap,
//   TokenPrice,
// } from "../types/schema";
// import {
//   ConfigurableRightsPool,
//   OwnershipTransferred,
// } from "../types/Factory/ConfigurableRightsPool";

import { WeightedPool, WeightedPoolPosition } from "../../generated/schema";

import {
  GNO_ADDRESS,
  updatePoolPositionsAfterSwap,
  updatePoolPositionsAfterTransfer,
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

  //NOTE the rations don't change, bur there is one guy which is now downgraded to zero?
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
    updatePoolPositionsAfterSwap(event, id, gnoIn, gnoOut);
  }
}

/************************************
 *********** POOL SHARES ************
 ************************************/

export function handleTransfer(event: Transfer): void {
  const id = event.address.toHex();

  const from = event.params.src;
  const to = event.params.dst;

  updatePoolPositionsAfterTransfer(event, id, from, to, event.params.amt);
  // let poolId = event.address.toHex();

  // let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  // let isMint = event.params.src.toHex() == ZERO_ADDRESS;
  // let isBurn = event.params.dst.toHex() == ZERO_ADDRESS;

  // let poolShareFromId = poolId.concat("-").concat(event.params.src.toHex());
  // let poolShareFrom = PoolShare.load(poolShareFromId);
  // let poolShareFromBalance =
  //   poolShareFrom == null ? ZERO_BD : poolShareFrom.balance;

  // let poolShareToId = poolId.concat("-").concat(event.params.dst.toHex());
  // let poolShareTo = PoolShare.load(poolShareToId);
  // let poolShareToBalance = poolShareTo == null ? ZERO_BD : poolShareTo.balance;

  // let pool = Pool.load(poolId);
  // if (pool != null) {
  //   if (isMint) {
  //     if (poolShareTo == null) {
  //       createPoolShareEntity(poolShareToId, poolId, event.params.dst.toHex());
  //       poolShareTo = PoolShare.load(poolShareToId);
  //     }
  //     if (poolShareTo != null) {
  //       poolShareTo.balance += tokenToDecimal(
  //         event.params.amt.toBigDecimal(),
  //         18
  //       );
  //       poolShareTo.save();
  //     }
  //     if (pool != null) {
  //       pool.totalShares += tokenToDecimal(event.params.amt.toBigDecimal(), 18);
  //     }
  //   } else if (isBurn) {
  //     if (poolShareFrom == null) {
  //       createPoolShareEntity(
  //         poolShareFromId,
  //         poolId,
  //         event.params.src.toHex()
  //       );
  //       poolShareFrom = PoolShare.load(poolShareFromId);
  //     }
  //     if (poolShareFrom != null) {
  //       poolShareFrom.balance -= tokenToDecimal(
  //         event.params.amt.toBigDecimal(),
  //         18
  //       );
  //       poolShareFrom.save();
  //     }
  //     if (pool != null) {
  //       pool.totalShares -= tokenToDecimal(event.params.amt.toBigDecimal(), 18);
  //     }
  //   } else {
  //     if (poolShareTo == null) {
  //       createPoolShareEntity(poolShareToId, poolId, event.params.dst.toHex());
  //       poolShareTo = PoolShare.load(poolShareToId);
  //     }
  //     if (poolShareTo != null) {
  //       poolShareTo.balance += tokenToDecimal(
  //         event.params.amt.toBigDecimal(),
  //         18
  //       );
  //       poolShareTo.save();
  //     }
  //     if (poolShareFrom == null) {
  //       createPoolShareEntity(
  //         poolShareFromId,
  //         poolId,
  //         event.params.src.toHex()
  //       );
  //       poolShareFrom = PoolShare.load(poolShareFromId);
  //     }
  //     if (poolShareFrom != null) {
  //       poolShareFrom.balance -= tokenToDecimal(
  //         event.params.amt.toBigDecimal(),
  //         18
  //       );
  //       poolShareFrom.save();
  //     }
  //   }

  //   if (
  //     poolShareTo !== null &&
  //     poolShareTo.balance.notEqual(ZERO_BD) &&
  //     poolShareToBalance.equals(ZERO_BD)
  //   ) {
  //     pool.holdersCount += BigInt.fromI32(1);
  //   }

  //   if (
  //     poolShareFrom !== null &&
  //     poolShareFrom.balance.equals(ZERO_BD) &&
  //     poolShareFromBalance.notEqual(ZERO_BD)
  //   ) {
  //     pool.holdersCount -= BigInt.fromI32(1);
  //   }

  //   pool.save();
}
