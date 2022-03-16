import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
  DecreaseLiquidity,
  IncreaseLiquidity,
  Transfer,
} from "../generated/NonfungiblePositionManager/NonfungiblePositionManager";
import { AMMPosition } from "../../subgraph-base/generated/schema";
import { updateForLiquidityChange } from "../../subgraph-base/src/uniswapV2/voteWeight";

const BI_ZERO = BigInt.fromI32(0);

function loadOrCreateAMMPosition(pair: Address, tokenId: BigInt): AMMPosition {
  const id = pair
    .toHexString()
    .concat("-")
    .concat(tokenId.toHexString());
  let entry = AMMPosition.load(id);
  if (entry === null) {
    entry = new AMMPosition(id);
    entry.pair = pair.toHex();
    entry.liquidity = BI_ZERO;
  }
  return entry;
}

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  const position = loadOrCreateAMMPosition(event.address, event.params.tokenId);
  const previousLiquidity = position.liquidity;
  position.liquidity = position.liquidity.plus(event.params.liquidity);
  position.save();

  updateForLiquidityChange(position, previousLiquidity);
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  const position = loadOrCreateAMMPosition(event.address, event.params.tokenId);
  const previousLiquidity = position.liquidity;
  position.liquidity = position.liquidity.minus(event.params.liquidity);
  position.save();

  updateForLiquidityChange(position, previousLiquidity);
}

export function handleTransfer(event: Transfer): void {
  const position = loadOrCreateAMMPosition(event.address, event.params.tokenId);
  const liquidity = position.liquidity;
  position.liquidity = BI_ZERO;
  updateForLiquidityChange(position, liquidity);

  position.liquidity = liquidity;
  position.user = event.params.to.toHexString();
  position.save();

  updateForLiquidityChange(position, BI_ZERO);
}
