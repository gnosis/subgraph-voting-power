import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { ConcentratedLiquidityPair } from "../../generated/schema";
import {
  Initialize,
  Swap as SwapEvent,
} from "../../generated/templates/Pool/Pool";

import { updateForRatioChange } from "./voteWeight";

export function handleInitialize(event: Initialize): void {
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
  const previousSqrtRatio = pair.sqrtRatio;
  pair.sqrtRatio = toX96Decimal(event.params.sqrtPriceX96);
  pair.save();

  updateForRatioChange(pair, previousSqrtRatio);
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
