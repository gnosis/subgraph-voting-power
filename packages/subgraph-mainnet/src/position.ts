/* eslint-disable prefer-const */
import {
  Collect,
  DecreaseLiquidity,
  IncreaseLiquidity,
  NonfungiblePositionManager,
  Transfer,
} from "../generated/NonfungiblePositionManager/NonfungiblePositionManager";
import { Bundle, AMMPosition, PositionSnapshot, Token } from "../types/schema";
import {
  ADDRESS_ZERO,
  factoryContract,
  ZERO_BD,
  ZERO_BI,
} from "../utils/constants";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { convertTokenToDecimal, loadTransaction } from "../utils";

function getPosition(
  event: ethereum.Event,
  tokenId: BigInt
): AMMPosition | null {
  let position = AMMPosition.load(tokenId.toString());
  if (position === null) {
    let contract = NonfungiblePositionManager.bind(event.address);
    let positionCall = contract.try_positions(tokenId);

    // the following call reverts in situations where the position is minted
    // and deleted in the same block - from my investigation this happens
    // in calls from  BancorSwap
    // (e.g. 0xf7867fa19aa65298fadb8d4f72d0daed5e836f3ba01f0b9b9631cdc6c36bed40)
    if (!positionCall.reverted) {
      let positionResult = positionCall.value;
      let poolAddress = factoryContract.getPool(
        positionResult.value2,
        positionResult.value3,
        positionResult.value4
      );

      position = new AMMPosition(tokenId.toString());
      // The owner gets correctly updated in the Transfer handler
      position.owner = Address.fromString(ADDRESS_ZERO);
      position.pool = poolAddress.toHexString();
      position.token0 = positionResult.value2.toHexString();
      position.token1 = positionResult.value3.toHexString();
      position.tickLower = position.pool
        .concat("#")
        .concat(positionResult.value5.toString());
      position.tickUpper = position.pool
        .concat("#")
        .concat(positionResult.value6.toString());
      position.liquidity = ZERO_BI;
      position.depositedToken0 = ZERO_BD;
      position.depositedToken1 = ZERO_BD;
      position.withdrawnToken0 = ZERO_BD;
      position.withdrawnToken1 = ZERO_BD;
      position.collectedFeesToken0 = ZERO_BD;
      position.collectedFeesToken1 = ZERO_BD;
      position.transaction = loadTransaction(event).id;
      position.feeGrowthInside0LastX128 = positionResult.value8;
      position.feeGrowthInside1LastX128 = positionResult.value9;

      position.amountDepositedUSD = ZERO_BD;
      position.amountWithdrawnUSD = ZERO_BD;
      position.amountCollectedUSD = ZERO_BD;
    }
  }

  return position;
}

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  let position = getPosition(event, event.params.tokenId);
  position.liquidity = position.liquidity.plus(event.params.liquidity);
  position.save();
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  let position = getPosition(event, event.params.tokenId);

  // position was not able to be fetched
  if (position == null) {
    return;
  }

  // temp fix
  if (
    Address.fromString(position.pool).equals(
      Address.fromHexString("0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248")
    )
  ) {
    return;
  }

  position.liquidity = position.liquidity.minus(event.params.liquidity);

  position.save();
}

export function handleTransfer(event: Transfer): void {
  let position = getPosition(event, event.params.tokenId);

  // position was not able to be fetched
  if (position == null) {
    return;
  }

  position.owner = event.params.to;
  position.save();

  savePositionSnapshot(position!, event);
}
