import { BigInt, BigDecimal, Address, log } from "@graphprotocol/graph-ts";
import {
  ConcentratedLiquidityPair,
  ConcentratedLiquidityPosition,
  User,
} from "../../../subgraph-base/generated/schema";
import { loadOrCreateUser } from "../../../subgraph-base/src/helpers";

export function updateForLiquidityChange(
  position: ConcentratedLiquidityPosition,
  previousLiquidity: BigInt
): void {
  const pair = ConcentratedLiquidityPair.load(position.pair);
  if (!pair) throw new Error(`Pair with id ${position.pair} not found`);
  const gnoIsFirst = pair.gnoIsFirst;
  const sqrtRatio = pair.sqrtRatio;

  if (sqrtRatio.equals(ZERO_BD)) {
    // Since Sync will only be emitted after transfer, we have no sqrtRatio available
    // for the very first LP token transfer. We simply don't update the voting weight here
    // as we can rely on it being set in the handling of the upcoming Sync event.
    log.info("skipping vote weight calculation for first deposit into {}", [
      pair.id,
    ]);
    return;
  }

  const user = loadOrCreateUser(Address.fromString(position.user));

  // temporarily set position liquidity to the previous value
  const newLiquidity = position.liquidity;
  position.liquidity = previousLiquidity;
  const amountToSubtract = gnoIsFirst
    ? getToken0Balance(position, sqrtRatio)
    : getToken1Balance(position, sqrtRatio);
  position.liquidity = newLiquidity;

  // add vote weight for the new liquidity value
  const amountToAdd = gnoIsFirst
    ? getToken0Balance(position, pair.sqrtRatio)
    : getToken1Balance(position, pair.sqrtRatio);

  user.voteWeight = user.voteWeight.minus(amountToSubtract).plus(amountToAdd);
  user.save();
  log.info("gnoIsFirst: {}, pair.sqrtRatio: {}", [
    gnoIsFirst.toString(),
    pair.sqrtRatio.toString(),
  ]);
  log.info(
    "updated voting weight of user {} (-{}, +{}) for liquidity change (old: {}, new: {})",
    [
      user.id,
      amountToSubtract.toString(),
      amountToAdd.toString(),
      previousLiquidity.toString(),
      newLiquidity.toString(),
    ]
  );
}

export function updateForRatioChange(
  pair: ConcentratedLiquidityPair,
  previousSqrtRatio: BigDecimal
): void {
  const sqrtRatio = pair.sqrtRatio;
  if (sqrtRatio.equals(previousSqrtRatio)) return;

  const gnoIsFirst = pair.gnoIsFirst;
  const positions = pair.positions;
  for (let index = 0; index < positions.length; index++) {
    const position = ConcentratedLiquidityPosition.load(positions[index]);
    if (position) {
      const user = loadOrCreateUser(Address.fromString(position.user));
      if (!user) throw new Error(`User with id ${position.user} not found`);

      log.info("gnoIsFirst: {}, pair.sqrtRatio: {}", [
        gnoIsFirst.toString(),
        pair.sqrtRatio.toString(),
      ]);

      // add vote weight for new ratio
      const amountToAdd = gnoIsFirst
        ? getToken0Balance(position, pair.sqrtRatio)
        : getToken1Balance(position, pair.sqrtRatio);

      // subtract vote weight for previous ratio
      let amountToSubtract = ZERO_BI;
      if (previousSqrtRatio.equals(ZERO_BD)) {
        amountToSubtract = gnoIsFirst
          ? getToken0Balance(position, previousSqrtRatio)
          : getToken1Balance(position, previousSqrtRatio);
      }

      user.voteWeight = user.voteWeight
        .plus(amountToAdd)
        .minus(amountToSubtract);
      user.save();

      log.info(
        "updated voting weight of user {} (-{}, +{}) for ratio change (old: {}, new: {})",
        [
          user.id,
          amountToSubtract.toString(),
          amountToAdd.toString(),
          previousSqrtRatio.toString(),
          sqrtRatio.toString(),
        ]
      );
    }
  }
}

function getToken0Balance(
  position: ConcentratedLiquidityPosition,
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
  position: ConcentratedLiquidityPosition,
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

const ZERO_BI = BigInt.fromI32(0);
const ONE_BI = BigInt.fromI32(1);
const ZERO_BD = BigDecimal.fromString("0");
const ONE_BD = BigDecimal.fromString("1");

// taken from: https://github.com/Uniswap/v3-subgraph/blob/be1d1f5506b02606a32c17aa9098e82b8fee7d12/src/utils/index.ts
function bigDecimalExponated(value: BigDecimal, power: BigInt): BigDecimal {
  if (power.equals(ZERO_BI)) {
    return ONE_BD;
  }
  let negativePower = power.lt(ZERO_BI);
  let result = ZERO_BD.plus(value);
  let powerAbs = power.abs();
  for (let i = ONE_BI; i.lt(powerAbs); i = i.plus(ONE_BI)) {
    result = result.times(value);
  }

  if (negativePower) {
    result = safeDiv(ONE_BD, result);
  }

  return result;
}

// return 0 if denominator is 0 in division
function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
  if (amount1.equals(ZERO_BD)) {
    return ZERO_BD;
  } else {
    return amount0.div(amount1);
  }
}
