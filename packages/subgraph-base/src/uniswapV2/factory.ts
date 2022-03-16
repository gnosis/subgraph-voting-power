import { Address, log } from "@graphprotocol/graph-ts";
import { PairCreated } from "../../generated/Factory/Factory";
import { AMMPair } from "../../generated/schema";
import { Pair } from "../../generated/templates";
import { gno, GNO_ADDRESS } from "../helpers";

export function handleNewPair(event: PairCreated): void {
  const isGnoTradingPair =
    event.params.token0.equals(GNO_ADDRESS) ||
    event.params.token1.equals(GNO_ADDRESS);

  if (isGnoTradingPair) {
    createAMMPair(event.params.pair, event.params.token0, event.params.token1);
  }
}

export function createAMMPair(
  address: Address,
  token0: Address,
  token1: Address
): AMMPair {
  const id = address.toHexString();
  const pair = new AMMPair(id);
  pair.gnoIsFirst = token0 === GNO_ADDRESS;
  pair.save();

  return pair;
}
