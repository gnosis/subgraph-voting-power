import { Transfer as TransferEvent } from "../../generated-gc/templates/UniswapV2Pair/ERC20";
import {
  Sync as SyncEvent,
  Swap as SwapEvent,
} from "../../generated-gc/templates/UniswapV2Pair/Pair";
import { User, WeightedPool } from "../../generated/schema";
import {
  loadPool,
  weightedPoolSwap,
  weightedPoolTransfer,
  ZERO_BI,
} from "../helpers";

export function handleSync(event: SyncEvent): void {
  const pool = loadPool(event.address);
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

  // for UniswapV2 the we have the following ordering of events:
  // - reserve0 token transfer event
  // - reserve1 token transfer event
  // - LP token transfer event
  // - Sync event
  // As weightedPoolTransfer relies on the pools GNO balance being up-to-date,
  // we make sure it is.
  const pool = WeightedPool.load(id);
  if (!pool) throw new Error(`Expected WeightedPool #${id} to exist`);
  const userEntryForPool = User.load(id);
  pool.gnoBalance = userEntryForPool ? userEntryForPool.gno : ZERO_BI;
  pool.save();

  weightedPoolTransfer(event, from, to, value);
}

export function handleSwap(event: SwapEvent): void {
  // swaps don't change LP token total supply, but they do change the GNO reserves and thus the ratio

  const pool = loadPool(event.address);
  if (!pool) return;

  const gnoIn = pool.gnoIsFirst
    ? event.params.amount0In
    : event.params.amount1In;
  const gnoOut = pool.gnoIsFirst
    ? event.params.amount0Out
    : event.params.amount1Out;

  // Swap is emitted after Sync, so pool.gnoBalance has already been set to the latest state in handleSync when we arrive here.
  weightedPoolSwap(pool, gnoIn, gnoOut);
}
