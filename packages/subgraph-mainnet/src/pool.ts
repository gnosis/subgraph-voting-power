import { AMMPair, AMMPosition, User } from "../generated/schema";
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  Initialize,
  Swap as SwapEvent,
} from "../generated/templates/Pool/Pool";
import { bigDecimalExponated } from "./helpers";

export function handleInitialize(event: Initialize): void {
  // initialize pool sqrt price
  const pair = loadAMMPair(event.address);
  if (!pair) return;
  pair.sqrtRatio = toX96Decimal(event.params.sqrtPriceX96);
  pair.save();
}

export function handleSwap(event: SwapEvent): void {
  const pair = loadAMMPair(event.address);
  const previousSqrtRatio = pair.sqrtRatio;
  pair.sqrtRatio = toX96Decimal(event.params.sqrtPriceX96);
  pair.save();

  updateVoteWeight(pair, pair.sqrtRatio, previousSqrtRatio);
}

export function updateVoteWeight(
  pair: AMMPair,
  sqrtRatio: BigDecimal,
  previousSqrtRatio: BigDecimal
): void {
  if (sqrtRatio.equals(previousSqrtRatio)) return;

  const gnoIsFirst = pair.gnoIsFirst;
  const positions = pair.positions;
  for (let index = 0; index < positions.length; index++) {
    const position = AMMPosition.load(positions[index]);
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
  }
}

function toX96Decimal(bi: BigInt): BigDecimal {
  return bi.toBigDecimal().div(BigDecimal.fromString((2 ** 96).toString()));
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

  if (sqrtRatio < lowerBound) {
    // liquidity is fully in token0
    // use equation (4) from https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
    return bigDecimalToBigInt(
      position.liquidity
        .toBigDecimal()
        .times(upperBound.minus(lowerBound))
        .div(lowerBound.times(upperBound))
    );
  } else if (sqrtRatio > upperBound) {
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

  if (sqrtRatio < lowerBound) {
    // liquidity is fully in token0
    return BigInt.fromI32(0);
  } else if (sqrtRatio > upperBound) {
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

function loadAMMPair(address: Address): AMMPair {
  const id = address.toHexString();
  const pair = AMMPair.load(id);
  if (!pair) throw new Error(`pair with ID ${id} not found`);
  return pair;
}
