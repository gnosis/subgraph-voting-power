import { Address, log } from "@graphprotocol/graph-ts";
import { ConcentratedLiquidityPair } from "../../generated/schema";
import { PoolCreated as PoolCreatedEvent } from "../../generated/ds-uniswap-v3-factory/Factory";
import { UniswapV3Pool as UniswapV3PoolTemplate } from "../../generated/templates";

import { GNO_ADDRESS, ZERO_BD } from "../constants";

export function handlePoolCreated(event: PoolCreatedEvent): void {
  const isGnoTradingPair =
    event.params.token0.equals(GNO_ADDRESS) ||
    event.params.token1.equals(GNO_ADDRESS);

  if (isGnoTradingPair) {
    createConcentratedLiquidityPair(
      event.params.pool,
      event.params.token0,
      event.params.token1
    );
  }
}

function createConcentratedLiquidityPair(
  address: Address,
  token0: Address,
  token1: Address
): ConcentratedLiquidityPair {
  UniswapV3PoolTemplate.create(address);
  const id = address.toHexString();
  log.info("instantiated ConcentratedLiquidityPair instance: {}", [id]);
  const pair = new ConcentratedLiquidityPair(id);
  pair.gnoIsFirst = token0.equals(GNO_ADDRESS);
  pair.sqrtRatio = ZERO_BD;
  pair.positions = [];
  pair.save();
  return pair;
}
