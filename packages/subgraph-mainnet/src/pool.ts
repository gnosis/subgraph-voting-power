import { AMMPair } from "../../subgraph-base/generated/schema";
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  Initialize,
  Swap as SwapEvent,
} from "../generated/templates/Pool/Pool";

import { updateForRatioChange } from "../../subgraph-base/src/uniswapV2/voteWeight";

export function handleInitialize(event: Initialize): void {
  // initialize pool sqrt price
  const pair = loadAMMPair(event.address);
  if (!pair) return;
  pair.sqrtRatio = toX96Decimal(event.params.sqrtPriceX96);
  pair.save();
}

export function handleSwap(event: SwapEvent): void {
  const pair = loadAMMPair(event.address);
  const previousSqrtRatio = pair.sqrtRatio;
  pair.sqrtRatio = toX96Decimal(event.params.sqrtPriceX96);
  pair.save();

  updateForRatioChange(pair, previousSqrtRatio);
}

function toX96Decimal(bi: BigInt): BigDecimal {
  return bi.toBigDecimal().div(BigDecimal.fromString((2 ** 96).toString()));
}

function loadAMMPair(address: Address): AMMPair {
  const id = address.toHexString();
  const pair = AMMPair.load(id);
  if (!pair) throw new Error(`pair with ID ${id} not found`);
  return pair;
}
