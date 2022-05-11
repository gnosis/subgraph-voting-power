import { Address, BigInt, ethereum, log, store } from "@graphprotocol/graph-ts";
import {
  DecreaseLiquidity,
  IncreaseLiquidity,
  NonfungiblePositionManager,
  Transfer,
} from "../../generated/ds-uniswap-v3-position/NonfungiblePositionManager";
import { Factory as FactoryContract } from "../../generated/ds-uniswap-v3-position/Factory";

import {
  ConcentratedLiquidityPair,
  ConcentratedLiquidityPosition,
} from "../../generated/schema";

import { updateForLiquidityChange } from "./voteWeight";
import { ADDRESS_ZERO, GNO_ADDRESS, ZERO_BI } from "../constants";

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  const position = loadOrCreateConcentratedLiquidityPosition(
    event,
    event.params.tokenId
  );
  if (position == null) return;

  const previousLiquidity = position.liquidity;
  position.liquidity = position.liquidity.plus(event.params.liquidity);
  position.save();

  updateForLiquidityChange(position, previousLiquidity);
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  const position = loadOrCreateConcentratedLiquidityPosition(
    event,
    event.params.tokenId
  );
  if (position == null) return;

  const previousLiquidity = position.liquidity;
  position.liquidity = position.liquidity.minus(event.params.liquidity);

  updateForLiquidityChange(position, previousLiquidity);
  removeOrSavePosition(position);
}

export function handleTransfer(event: Transfer): void {
  const position = loadOrCreateConcentratedLiquidityPosition(
    event,
    event.params.tokenId
  );
  if (position == null) return;

  const recipient = event.params.to.toHexString();
  const liquidity = position.liquidity;

  log.info("Transfer nun-fungible position {} from {} to {} (liquidity: {})", [
    position.id,
    (position.user || "") as string,
    recipient,
    liquidity.toString(),
  ]);

  // update vote weight of sender
  if (position.user != ADDRESS_ZERO.toHexString()) {
    // temporarily set to zero for updating vote weight
    position.liquidity = ZERO_BI;
    updateForLiquidityChange(position, liquidity);
    position.liquidity = liquidity;
  }

  // update vote weight of recipient
  position.user = recipient;
  position.save();
  updateForLiquidityChange(position, ZERO_BI);
}

export const FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const factoryContract = FactoryContract.bind(
  Address.fromString(FACTORY_ADDRESS)
);

function loadOrCreateConcentratedLiquidityPosition(
  event: ethereum.Event,
  tokenId: BigInt
): ConcentratedLiquidityPosition | null {
  let position = ConcentratedLiquidityPosition.load(tokenId.toString());

  if (!position) {
    const contract = NonfungiblePositionManager.bind(event.address);
    const positionCall = contract.try_positions(tokenId);

    if (positionCall.reverted) {
      // apparently this happens :/
      // (see: https://github.com/Uniswap/v3-subgraph/blob/bf03f940f17c3d32ee58bd37386f26713cff21e2/src/mappings/position-manager.ts#L20)
      log.warning("positions call reverted, could not create position {}", [
        tokenId.toString(),
      ]);
      return null;
    }
    const positionResult = positionCall.value;
    const tokenA = positionResult.value2;
    const tokenB = positionResult.value3;

    if (!tokenA.equals(GNO_ADDRESS) && !tokenB.equals(GNO_ADDRESS)) {
      // we don't track this pair, so we can ignore this position
      return null;
    }

    const poolAddress = factoryContract.getPool(
      tokenA,
      tokenB,
      positionResult.value4
    );
    const pair = ConcentratedLiquidityPair.load(poolAddress.toHexString());
    if (!pair) {
      throw new Error(`Could not find pair ${poolAddress.toHexString()}`);
    }

    position = new ConcentratedLiquidityPosition(tokenId.toString());
    // The user gets correctly updated in the Transfer handler
    position.user = ADDRESS_ZERO.toHexString();
    position.pair = poolAddress.toHexString();
    position.liquidity = ZERO_BI;
    position.lowerTick = BigInt.fromI32(positionResult.value5);
    position.upperTick = BigInt.fromI32(positionResult.value6);
    position.save();

    pair.positions = pair.positions.concat([tokenId.toString()]);
    pair.save();

    log.info(
      "created new position {} in pair {} with lower tick: {}, upper tick: {}",
      [
        tokenId.toString(),
        pair.id,
        position.lowerTick.toString(),
        position.upperTick.toString(),
      ]
    );
  }

  return position;
}

function removeOrSavePosition(position: ConcentratedLiquidityPosition): void {
  if (position.liquidity.equals(ZERO_BI)) {
    store.remove("ConcentratedLiquidityPosition", position.id);
    const pair = ConcentratedLiquidityPair.load(position.pair);
    if (pair) {
      pair.positions = arrayRemove(pair.positions, position.id);
      pair.save();
    }
    log.info("removed concentrated liquidity position {}", [position.id]);
  } else {
    log.info("save {}", [position.liquidity.toString()]);
    position.save();
  }
}

function arrayRemove(array: string[], elementToRemove: string): string[] {
  const index = array.indexOf(elementToRemove);
  return array.slice(0, index).concat(array.slice(index + 1));
}
