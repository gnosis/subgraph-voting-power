import { BigInt, log, store, Address } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../../generated-gc/templates/UniswapV2Pair/ERC20";
import {
  Sync as SyncEvent,
  Swap as SwapEvent,
} from "../../generated-gc/templates/UniswapV2Pair/Pair";
import { WeightedPool, WeightedPoolPosition } from "../../generated/schema";
import {
  updatePoolPositionsAfterSwap,
  updatePoolPositionsAfterTransfer,
} from "../helpers";

export function handleSync(event: SyncEvent): void {
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

  pool.gnoBalance = pool.gnoIsFirst
    ? event.params.reserve0
    : event.params.reserve1;
  pool.save();
}

export function handleTransfer(event: TransferEvent): void {
  const id = event.address.toHexString();
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;

  updatePoolPositionsAfterTransfer(event, id, from, to, value);
}

export function handleSwap(event: SwapEvent): void {
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
  // swaps don't change LP token total supply, but they do change the GNO reserves and thus the ratio
  const gnoIn = pool.gnoIsFirst
    ? event.params.amount0In
    : event.params.amount1In;
  const gnoOut = pool.gnoIsFirst
    ? event.params.amount0Out
    : event.params.amount1Out;

  updatePoolPositionsAfterSwap(event, id, gnoIn, gnoOut);
}
