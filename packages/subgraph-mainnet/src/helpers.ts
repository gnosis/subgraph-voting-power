import { log, BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts";
import { ERC20 } from "../generated/Factory/ERC20";
import { AMMPair, AMMPosition } from "../generated/schema";

export const GNO_ADDRESS = Address.fromString(
  "0x6810e776880c02933d47db1b9fc05908e5386b96"
);

// The minimum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MIN_TICK)
// see: https://github.com/Uniswap/v3-core/blob/fc2107bd5709cdee6742d5164c1eb998566bcb75/contracts/libraries/TickMath.sol#L14
const MIN_SQRT_RATIO = BigInt.fromString("4295128739");
// The maximum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MAX_TICK)
// https://github.com/Uniswap/v3-core/blob/fc2107bd5709cdee6742d5164c1eb998566bcb75/contracts/libraries/TickMath.sol#L15
const MAX_SQRT_RATIO = BigInt.fromString(
  "1461446703485210103287273052203988822378723970342"
);

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
