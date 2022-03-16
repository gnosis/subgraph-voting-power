import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  DecreaseLiquidity,
  IncreaseLiquidity,
  Transfer,
} from "../generated/NonfungiblePositionManager/NonfungiblePositionManager";
import { AMMPosition } from "../generated/schema";

function loadOrCreateAMMPosition(pair: Address, tokenId: BigInt): AMMPosition {
  const id = pair
    .toHexString()
    .concat("-")
    .concat(tokenId.toHexString());
  let entry = AMMPosition.load(id);
  if (entry === null) {
    entry = new AMMPosition(id);
    entry.pair = pair.toHex();
    entry.liquidity = BigInt.fromI32(0);
  }
  return entry;
}

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  const position = loadOrCreateAMMPosition(event.address, event.params.tokenId);
  position.liquidity = position.liquidity.plus(event.params.liquidity);
  position.save();
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  const position = loadOrCreateAMMPosition(event.address, event.params.tokenId);
  position.liquidity = position.liquidity.minus(event.params.liquidity);
  position.save();
}

export function handleTransfer(event: Transfer): void {
  const position = loadOrCreateAMMPosition(event.address, event.params.tokenId);
  position.user = event.params.to.toHexString();
  position.save();
}
