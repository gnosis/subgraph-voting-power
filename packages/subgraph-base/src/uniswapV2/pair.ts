import { BigInt, log, store, Address } from "@graphprotocol/graph-ts";
import { Transfer, Sync } from "../../generated/templates/Pair/Pair";

import { ADDRESS_ZERO, loadOrCreateUser, removeOrSaveUser } from "../helpers";
import { AMMPair, AMMPosition } from "../../generated/schema";
import { updateForLiquidityChange, updateForRatioChange } from "./voteWeight";

export function handleTransfer(event: Transfer): void {
  const pair = loadAMMPair(event.address);
  const value = event.params.value;
  const from = event.params.from;
  const to = event.params.to;
  const userTo = loadOrCreateUser(to);
  const userFrom = loadOrCreateUser(from);

  // decrease liquidity and voting weight of sender
  if (
    from.toHexString() != ADDRESS_ZERO.toHexString() &&
    from.toHexString() != pair.id
  ) {
    const position = loadOrCreateAMMPosition(event.address, from);
    const previousLiquidity = position.liquidity;
    position.liquidity = position.liquidity.minus(value);
    updateForLiquidityChange(position, previousLiquidity);

    if (position.liquidity == BigInt.fromI32(0)) {
      store.remove("AMMPosition", position.id);
    } else {
      position.save();
    }
    removeOrSaveUser(userFrom);
  }

  // increase liquidity and voting weight of recipient
  if (
    event.params.to.toHexString() != ADDRESS_ZERO.toHexString() &&
    to.toHexString() != pair.id
  ) {
    // increase position balance
    const position = loadOrCreateAMMPosition(event.address, to);
    const previousLiquidity = position.liquidity;
    position.liquidity = position.liquidity.plus(value);
    updateForLiquidityChange(position, previousLiquidity);

    position.save();
    // increase vote weight
    removeOrSaveUser(userTo);
  }
}

export function handleSync(event: Sync): void {
  const pair = loadAMMPair(event.address);
  const sqrtRatio = event.params.reserve1
    .toBigDecimal()
    .div(event.params.reserve0.toBigDecimal());
  const previousSqrtRatio = pair.sqrtRatio;
  pair.sqrtRatio = sqrtRatio;
  pair.save();
  updateForRatioChange(pair, previousSqrtRatio);
}

export function loadAMMPair(address: Address): AMMPair {
  const id = address.toHexString();
  const pair = AMMPair.load(id);
  if (!pair) throw new Error(`Pair with id ${id} not found`);
  return pair;
}

// The minimum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**-128
// see: https://github.com/Uniswap/v3-core/blob/fc2107bd5709cdee6742d5164c1eb998566bcb75/contracts/libraries/TickMath.sol#L14
const MIN_TICK = -887272;
// The maximum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**128
// see: https://github.com/Uniswap/v3-core/blob/fc2107bd5709cdee6742d5164c1eb998566bcb75/contracts/libraries/TickMath.sol#L15
const MAX_TICK = -MIN_TICK;

export function loadOrCreateAMMPosition(
  pair: Address,
  user: Address
): AMMPosition {
  const id = pair
    .toHexString()
    .concat("-")
    .concat(user.toHexString());
  let position = AMMPosition.load(id);
  if (position === null) {
    position = new AMMPosition(id);
    position.pair = pair.toHexString();
    position.user = user.toHexString();
    position.liquidity = BigInt.fromI32(0);
    position.lowerTick = BigInt.fromI32(MIN_TICK);
    position.upperTick = BigInt.fromI32(MAX_TICK);
    position.save();
    log.info("created new position {} in pair {}", [id, pair.toHexString()]);
  }

  return position;
}
