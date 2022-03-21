import { Address, log } from "@graphprotocol/graph-ts";
import { ConcentratedLiquidityPair } from "../../../subgraph-base/generated/schema";
import { PoolCreated } from "../../generated/Factory/Factory";
import { Pool } from "../../generated/templates";

const GNO_ADDRESS = Address.fromString(
  "0x6810e776880c02933d47db1b9fc05908e5386b96"
);

export function handlePoolCreated(event: PoolCreated): void {
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
  Pool.create(address);
  const id = address.toHexString();
  log.info("instantiated ConcentratedLiquidityPair instance: {}", [id]);
  const pair = new ConcentratedLiquidityPair(id);
  pair.gnoIsFirst = token0.equals(GNO_ADDRESS);
  pair.save();
  return pair;
}
