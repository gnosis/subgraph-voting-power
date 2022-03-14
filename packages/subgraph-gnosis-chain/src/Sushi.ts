/* eslint-disable prefer-const */
import { Address, log } from "@graphprotocol/graph-ts";
import { PairCreated } from "../generated/Sushi/Factory";
import { Pair } from "../generated/templates";
import { GNO_ADDRESS, loadOrCreateAMMPair } from "./helpers";

export function handleNewPair(event: PairCreated): void {
  const isGnoTradingPair =
    event.params.token0.equals(GNO_ADDRESS) ||
    event.params.token1.equals(GNO_ADDRESS);

  if (isGnoTradingPair) {
    loadOrCreateAMMPair(event.params.pair);
    // log.info("Found GNO in POOL: {}", [event.params.pair.toHex()]);
  }
}
