import { BigInt, BigDecimal, Address, log } from "@graphprotocol/graph-ts";
import {
  ConcentratedLiquidityPair,
  ConcentratedLiquidityPosition,
} from "../../generated/schema";
import { loadOrCreateUser, removeOrSaveUser, ZERO_BI } from "../helpers";

export function updateForLiquidityChange(
  position: ConcentratedLiquidityPosition,
  deltaLiquidity: BigInt
): void {
  if (!position.user) {
    log.warning("Tried updating vote weight of position without user: {}", [
      position.id,
    ]);
    return;
  }

  if (position.user != "0x849d52316331967b6ff1198e5e32a0eb168d039d") {
    return;
  }

  const pair = ConcentratedLiquidityPair.load(position.pair);
  if (!pair) throw new Error(`Pair with id ${position.pair} not found`);

  const gnoIsFirst = pair.gnoIsFirst;
  const sqrtRatio = pair.sqrtRatio;

  if (sqrtRatio.equals(ZERO_BD)) {
    log.warning(
      "Cannot update position {} since sqrtRatio is not yet initialized for pair {}",
      [position.id, pair.id]
    );
    return;
  }

  const user = loadOrCreateUser(Address.fromString(position.user as string));

  const prevLiquidity = position.liquidity;
  const nextLiquidity = position.liquidity.plus(deltaLiquidity);

  const prevVoteWeight = gnoIsFirst
    ? getToken0Balance(position, prevLiquidity, sqrtRatio)
    : getToken1Balance(position, prevLiquidity, sqrtRatio);

  const nextVoteWeight = gnoIsFirst
    ? getToken0Balance(position, nextLiquidity, sqrtRatio)
    : getToken1Balance(position, nextLiquidity, sqrtRatio);

  const deltaVoteWeight = nextVoteWeight.minus(prevVoteWeight);

  if (!deltaVoteWeight.equals(ZERO_BI)) {
    user.voteWeight = user.voteWeight.plus(deltaVoteWeight);
    removeOrSaveUser(user);
  }
}

export function updateForRatioChange(
  pair: ConcentratedLiquidityPair,
  nextSqrtRatio: BigDecimal
): void {
  const sqrtRatio = pair.sqrtRatio;
  if (sqrtRatio.equals(nextSqrtRatio)) return;

  const gnoIsFirst = pair.gnoIsFirst;
  for (let index = 0; index < pair.positions.length; index++) {
    const position = ConcentratedLiquidityPosition.load(pair.positions[index]);
    if (
      position &&
      position.user &&
      position.user == "0x849d52316331967b6ff1198e5e32a0eb168d039d"
    ) {
      const user = loadOrCreateUser(
        Address.fromString(position.user as string)
      );

      let prevVoteWeight = ZERO_BI;
      if (!pair.sqrtRatio.equals(ZERO_BD)) {
        prevVoteWeight = gnoIsFirst
          ? getToken0Balance(position, position.liquidity, pair.sqrtRatio)
          : getToken1Balance(position, position.liquidity, pair.sqrtRatio);
      }

      const nextVoteWeight = gnoIsFirst
        ? getToken0Balance(position, position.liquidity, nextSqrtRatio)
        : getToken1Balance(position, position.liquidity, nextSqrtRatio);

      const deltaVoteWeight = nextVoteWeight.minus(prevVoteWeight);

      if (!deltaVoteWeight.equals(ZERO_BI)) {
        user.voteWeight = user.voteWeight.plus(deltaVoteWeight);
        removeOrSaveUser(user);
      }
    }
  }
}

export function getToken0Balance(
  position: ConcentratedLiquidityPosition,
  liquidity: BigInt,
  sqrtRatio: BigDecimal
): BigInt {
  // lower and upper bounds are expressed as a tick indices (exponents to sqrt(1.0001))
  // see: Uniswap v3 whitepaper section 6.1 and equation 6.2
  const lowerBound = bigDecimalExponated(
    BigDecimal.fromString("1.0001"),
    position.lowerTick.div(BigInt.fromI32(2))
  );
  const upperBound = bigDecimalExponated(
    BigDecimal.fromString("1.0001"),
    position.upperTick.div(BigInt.fromI32(2))
  );

  if (sqrtRatio < lowerBound) {
    // liquidity is fully in token0
    // use equation (4) from https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
    const result = bigDecimalToBigInt(
      liquidity
        .toBigDecimal()
        .times(upperBound.minus(lowerBound))
        .div(lowerBound.times(upperBound))
    );
    log.info(
      "liquidity ({}) of position {} is fully in GNO at sqrtRatio {}, balance: {}",
      [
        liquidity.toString(),
        position.id,
        sqrtRatio.toString(),
        result.toString(),
      ]
    );
    return result;
  } else if (sqrtRatio > upperBound) {
    // liquidity is fully in token1
    log.info(
      "liquidity ({}) of position {} is fully in other token at sqrtRatio {}",
      [liquidity.toString(), position.id, sqrtRatio.toString()]
    );
    return ZERO_BI;
  } else {
    // liquidity is in token0 and token1
    // use equation (11) from https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
    const result = bigDecimalToBigInt(
      liquidity
        .toBigDecimal()
        .times(upperBound.minus(sqrtRatio))
        .div(sqrtRatio.times(upperBound))
    );
    log.info(
      "liquidity ({}) of position {} is partially in GNO at sqrtRatio {}, balance: {}",
      [
        liquidity.toString(),
        position.id,
        sqrtRatio.toString(),
        result.toString(),
      ]
    );
    return result;
  }
}

export function getToken1Balance(
  position: ConcentratedLiquidityPosition,
  liquidity: BigInt,
  sqrtRatio: BigDecimal
): BigInt {
  // lower and upper bounds are expressed as a tick indices (exponents to sqrt(1.0001))
  // see: Uniswap v3 whitepaper section 6.1 and equation 6.2
  const lowerBound = bigDecimalExponated(
    BigDecimal.fromString("1.0001"),
    position.lowerTick.div(BigInt.fromI32(2))
  );
  const upperBound = bigDecimalExponated(
    BigDecimal.fromString("1.0001"),
    position.upperTick.div(BigInt.fromI32(2))
  );

  if (sqrtRatio < lowerBound) {
    // liquidity is fully in token0
    log.info(
      "liquidity ({}) of position {} is fully in other token at sqrtRatio {}",
      [liquidity.toString(), position.id, sqrtRatio.toString()]
    );
    return ZERO_BI;
  } else if (sqrtRatio > upperBound) {
    // liquidity is fully in token1
    // use equation (8) from https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
    const result = bigDecimalToBigInt(
      liquidity.toBigDecimal().times(upperBound.minus(lowerBound))
    );
    log.info(
      "liquidity ({}) of position {} is fully in GNO at sqrtRatio {}, balance: {}",
      [
        liquidity.toString(),
        position.id,
        sqrtRatio.toString(),
        result.toString(),
      ]
    );
    return result;
  } else {
    // liquidity is in token0 and token1
    // use equation (12) from https://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
    const result = bigDecimalToBigInt(
      liquidity.toBigDecimal().times(sqrtRatio.minus(lowerBound))
    );
    log.info(
      "liquidity ({}) of position {} is partially in GNO at sqrtRatio {}, balance: {}",
      [
        liquidity.toString(),
        position.id,
        sqrtRatio.toString(),
        result.toString(),
      ]
    );
    return result;
  }
}

function bigDecimalToBigInt(bd: BigDecimal): BigInt {
  return BigInt.fromString(bd.toString().split(".")[0]);
}

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
