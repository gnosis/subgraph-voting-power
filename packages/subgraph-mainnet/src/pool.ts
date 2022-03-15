/* eslint-disable prefer-const */
import { AMMPair, AMMPosition, User } from "../generated/schema";
import { Address, BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  Initialize,
  Swap as SwapEvent,
} from "../generated/templates/Pool/Pool";
import { bigDecimalExponated, loadAMMPair } from "./helpers";

function toX96Decimal(bi: BigInt) {
  return bi.toBigDecimal().div(BigDecimal.fromString((2 ** 96).toString()));
}

export function handleInitialize(event: Initialize): void {
  // initialize pool sqrt price
  const pair = loadAMMPair(event.address);
  pair.sqrtRatio = toX96Decimal(event.params.sqrtPriceX96);
  pair.save();
}

export function handleSwap(event: SwapEvent): void {
  const pair = loadAMMPair(event.address);
  const previousSqrtRatio = pair.sqrtRatio;
  pair.sqrtRatio = toX96Decimal(event.params.sqrtPriceX96);

  const { gnoIsFirst } = pair;
  pair.positions.forEach((positionId) => {
    const position = AMMPosition.load(positionId);
    if (position) {
      const user = User.load(position.user);
      if (!user) throw new Error(`User with id ${position.user} not found`);

      // subtract vote weight from previous ratio
      const amountToSubtract = gnoIsFirst
        ? getToken0Balance(position, previousSqrtRatio)
        : getToken1Balance(position, previousSqrtRatio);

      // add vote weight from new ratio
      const amountToAdd = gnoIsFirst
        ? getToken0Balance(position, pair.sqrtRatio)
        : getToken1Balance(position, pair.sqrtRatio);

      user.voteWeight = user.voteWeight
        .minus(amountToSubtract)
        .plus(amountToAdd);
      user.save();
    }
  });

  pair.save();
}

function getToken0Balance(
  position: AMMPosition,
  sqrtRatio: BigDecimal
): BigInt {
  // 1.0001^tick is sqrt(token1/token0).

  // lower and upper bounds are expressed as a sqrt ratios
  // see: Uniswap v3 whitepaper section 6.1
  const lowerBound = bigDecimalExponated(
    BigDecimal.fromString("1.0001"),
    position.lowerTick
  );
  const upperBound = bigDecimalExponated(
    BigDecimal.fromString("1.0001"),
    position.upperTick
  );

  const ratio = sqrtRatio.times(sqrtRatio);

  if (ratio < lowerBound) {
    // liquidity is fully in token0
    // use equation (4) from https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
    return bigDecimalToBigInt(
      position.liquidity
        .toBigDecimal()
        .times(upperBound.minus(lowerBound))
        .div(lowerBound.times(upperBound))
    );
  } else if (ratio > upperBound) {
    // liquidity is fully in token1
    return BigInt.fromI32(0);
  } else {
    // liquidity is in token0 and token1
    // use equation (11) from https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
    return bigDecimalToBigInt(
      position.liquidity
        .toBigDecimal()
        .times(upperBound.minus(sqrtRatio))
        .div(sqrtRatio.times(upperBound))
    );
  }
}

function getToken1Balance(
  position: AMMPosition,
  sqrtRatio: BigDecimal
): BigInt {
  // 1.0001^tick is sqrt(token1/token0).

  // lower and upper bounds are expressed as a sqrt ratios
  // see: Uniswap v3 whitepaper section 6.1
  const lowerBound = bigDecimalExponated(
    BigDecimal.fromString("1.0001"),
    position.lowerTick
  );
  const upperBound = bigDecimalExponated(
    BigDecimal.fromString("1.0001"),
    position.upperTick
  );

  const ratio = sqrtRatio.times(sqrtRatio);

  if (ratio < lowerBound) {
    // liquidity is fully in token0
    return BigInt.fromI32(0);
  } else if (ratio > upperBound) {
    // liquidity is fully in token1
    // use equation (8) from https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
    return bigDecimalToBigInt(
      position.liquidity.toBigDecimal().times(upperBound.minus(lowerBound))
    );
  } else {
    // liquidity is in token0 and token1
    // use equation (12) from https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
    return bigDecimalToBigInt(
      position.liquidity.toBigDecimal().times(sqrtRatio.minus(lowerBound))
    );
  }
}

function bigDecimalToBigInt(bd: BigDecimal): BigInt {
  return BigInt.fromString(bd.toString().split(".")[0]);
}
