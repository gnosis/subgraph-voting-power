import { Address, dataSource, log } from "@graphprotocol/graph-ts";
import { PairCreated } from "../../generated/Factory/Factory";
import { WeightedPool } from "../../generated/schema";
import { Pair } from "../../generated/templates";
import { GNO_ADDRESS, ZERO_BI } from "../helpers";

export function handleNewPair(event: PairCreated): void {
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
  Pair.create(address);
  const id = address.toHexString();
  log.info("instantiated WeightedPool instance: {}", [id]);
  const pool = new WeightedPool(id);
  pool.gnoIsFirst = token0.equals(GNO_ADDRESS);
  pool.totalSupply = ZERO_BI;
  pool.gnoBalance = ZERO_BI;
  pool.save();
  return pool;
}
