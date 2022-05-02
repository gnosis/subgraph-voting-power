import { Address, log } from "@graphprotocol/graph-ts";
import { PairCreated as PairCreatedEvent } from "../../generated-gc/ds-uniswap-v2-factory/Factory";
import { WeightedPool } from "../../generated/schema";
import { UniswapV2Pair as UniwapV2PairTemplate } from "../../generated-gc/templates";

import { GNO_ADDRESS, ZERO_BI } from "../helpers";

export function handleNewPair(event: PairCreatedEvent): void {
  const isGnoTradingPair =
    event.params.token0.equals(GNO_ADDRESS) ||
    event.params.token1.equals(GNO_ADDRESS);

  if (isGnoTradingPair) {
    createWeightedPool(
      event.params.pair,
      event.params.token0,
      event.params.token1
    );
  }
}

function createWeightedPool(
  address: Address,
  token0: Address,
  token1: Address
): WeightedPool {
  UniwapV2PairTemplate.create(address);
  const id = address.toHexString();
  log.info("instantiated UniswapV2 WeightedPool instance: {}", [id]);
  const pool = new WeightedPool(id);
  pool.gnoIsFirst = token0.equals(GNO_ADDRESS);
  pool.totalSupply = ZERO_BI;
  pool.gnoBalance = ZERO_BI;
  pool.save();
  return pool;
}
