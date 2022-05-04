import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  Initialize as InitializeEvent,
  Swap as SwapEvent,
} from "../../generated/templates/UniswapV3Pool/Pool";

import { ConcentratedLiquidityPair } from "../../generated/schema";

import { updateForRatioChange as updateUserVoteWeightForRatioChange } from "./voteWeight";

export function handleInitialize(event: InitializeEvent): void {
  // initialize pool sqrt price
  const pair = loadConcentratedLiquidityPair(event.address);
  if (!pair) return;
  pair.sqrtRatio = toX96Decimal(event.params.sqrtPriceX96);
  pair.save();
  log.info("initialized pair {}, sqrtRatio: {}", [
    pair.id,
    pair.sqrtRatio.toString(),
  ]);
}

export function handleSwap(event: SwapEvent): void {
  const pair = loadConcentratedLiquidityPair(event.address);

  const nextSqrtRatio = toX96Decimal(event.params.sqrtPriceX96);
  updateUserVoteWeightForRatioChange(pair, nextSqrtRatio);
  pair.sqrtRatio = nextSqrtRatio;
  pair.save();
}

function toX96Decimal(bi: BigInt): BigDecimal {
  return bi.toBigDecimal().div(
    BigDecimal.fromString(
      BigInt.fromI32(2)
        .pow(96)
        .toString()
    )
  );
}

function loadConcentratedLiquidityPair(
  address: Address
): ConcentratedLiquidityPair {
  const id = address.toHexString();
  const pair = ConcentratedLiquidityPair.load(id);
  if (!pair) throw new Error(`pair with ID ${id} not found`);
  return pair;
}
