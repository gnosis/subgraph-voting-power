import { log, BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts";
import { ERC20 } from "../generated/Factory/ERC20";
import { AMMPair, AMMPosition } from "../generated/schema";

export const GNO_ADDRESS = Address.fromString(
  "0x6810e776880c02933d47db1b9fc05908e5386b96"
);

// The minimum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**-128
// see: https://github.com/Uniswap/v3-core/blob/fc2107bd5709cdee6742d5164c1eb998566bcb75/contracts/libraries/TickMath.sol#L14
const MIN_TICK = -887272;
// The maximum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**128
// see: https://github.com/Uniswap/v3-core/blob/fc2107bd5709cdee6742d5164c1eb998566bcb75/contracts/libraries/TickMath.sol#L15
const MAX_TICK = -MIN_TICK;

// The minimum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MIN_TICK)
// see: https://github.com/Uniswap/v3-core/blob/fc2107bd5709cdee6742d5164c1eb998566bcb75/contracts/libraries/TickMath.sol#L14
const MIN_SQRT_RATIO = BigInt.fromString("4295128739");
// The maximum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MAX_TICK)
// https://github.com/Uniswap/v3-core/blob/fc2107bd5709cdee6742d5164c1eb998566bcb75/contracts/libraries/TickMath.sol#L15
const MAX_SQRT_RATIO = BigInt.fromString(
  "1461446703485210103287273052203988822378723970342"
);

export function loadOrCreateAMMPosition(
  pair: Address,
  user: Address,
  lowerTick: BigInt = BigInt.fromI32(MIN_TICK),
  upperTick: BigInt = BigInt.fromI32(MAX_TICK)
): AMMPosition {
  const id = pair
    .toHexString()
    .concat("-")
    .concat(user.toHex())
    .concat("-")
    .concat(lowerTick.toString())
    .concat("-")
    .concat(upperTick.toString());
  let entry = AMMPosition.load(id);
  if (entry === null) {
    entry = new AMMPosition(id);
    entry.pair = pair.toHex();
    entry.user = user.toHex();
    entry.liquidity = BigInt.fromI32(0);
    entry.lowerTick = lowerTick;
    entry.upperTick = upperTick;
    entry.save();
  }

  return entry;
}

export function loadAMMPair(address: Address): AMMPair {
  const id = address.toHexString();
  const pair = AMMPair.load(id);
  if (!pair) throw new Error(`pair with ID ${id} not found`);
  return pair;
}

export function createAMMPair(
  address: Address,
  token0: Address,
  token1: Address
): AMMPair {
  const id = address.toHexString();
  const pair = new AMMPair(id);
  pair.gnoIsFirst = token0.toHexString() === GNO_ADDRESS.toHexString();
  pair.save();
  return pair;
}

const ZERO_BI = BigInt.fromI32(0);
const ONE_BI = BigInt.fromI32(1);

export function convertTokenToDecimal(
  tokenAmount: BigInt,
  exchangeDecimals: BigInt
): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");

// taken from: https://github.com/Uniswap/v3-subgraph/blob/be1d1f5506b02606a32c17aa9098e82b8fee7d12/src/utils/index.ts
export function bigDecimalExponated(
  value: BigDecimal,
  power: BigInt
): BigDecimal {
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
