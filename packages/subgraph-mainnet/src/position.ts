import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  DecreaseLiquidity,
  IncreaseLiquidity,
  Transfer,
} from "../generated/NonfungiblePositionManager/NonfungiblePositionManager";
import { AMMPair, AMMPosition } from "../../subgraph-base/generated/schema";
import { updateForLiquidityChange } from "../../subgraph-base/src/uniswapV2/voteWeight";

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

const BI_ZERO = BigInt.fromI32(0);

function loadOrCreateAMMPosition(
  pairAddress: Address,
  tokenId: BigInt
): AMMPosition {
  const pair = AMMPair.load(pairAddress.toHexString());
  if (!pair)
    throw new Error(`Could not find pair ${pairAddress.toHexString()}`);

  const id = pair.id.concat("-").concat(tokenId.toHexString());
  let position = AMMPosition.load(id);
  if (!position) {
    position = new AMMPosition(id);
    position.pair = pair.id;
    position.liquidity = BI_ZERO;
    position.save();

    pair.positions = pair.positions.concat([id]);
    pair.save();

    log.info("created new position {} in pair {}", [id, pair.id]);
  }
  return position;
}
