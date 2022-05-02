import { log } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../../generated-gc/templates/UniswapV2Pair/ERC20";
import {
  Sync as SyncEvent,
  Swap as SwapEvent,
} from "../../generated-gc/templates/UniswapV2Pair/Pair";
import { WeightedPool } from "../../generated/schema";
import { loadPool, weightedPoolSwap, weightedPoolTransfer } from "../helpers";

export function handleSync(event: SyncEvent): void {
  const pool = loadPool(event, event.address);
  if (!pool) return;

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

  weightedPoolTransfer(event, id, from, to, value);
}

export function handleSwap(event: SwapEvent): void {
  const pool = loadPool(event, event.address);
  if (!pool) return;

  const id = event.address.toHexString();

  // swaps don't change LP token total supply, but they do change the GNO reserves and thus the ratio
  const gnoIn = pool.gnoIsFirst
    ? event.params.amount0In
    : event.params.amount1In;
  const gnoOut = pool.gnoIsFirst
    ? event.params.amount0Out
    : event.params.amount1Out;

  weightedPoolSwap(event, id, gnoIn, gnoOut);
}
