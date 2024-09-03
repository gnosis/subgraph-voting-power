import { log, BigInt, Address, store, ethereum } from "@graphprotocol/graph-ts";
import { WeightedPool, WeightedPoolPosition } from "../../generated/schema";

import {
  loadOrCreate as loadOrCreateUser,
  saveOrRemove as saveOrRemoveUser,
} from "./user";

import { arrayRemove, ADDRESS_ZERO } from "../constants";

export function loadPool(address: Address): WeightedPool {
  const id = address.toHexString();
  const pool = WeightedPool.load(id);
  if (!pool) {
    log.error("Weighted pool with id {} could not be loaded", [id]);
    throw new Error(`WeightedPool with id ${id} not found`);
  }
  return pool;
}

export function loadOrCreatePosition(
  pool: WeightedPool,
  user: Address
): WeightedPoolPosition {
  const id = pool.id.concat("-").concat(user.toHexString());
  let position = WeightedPoolPosition.load(id);
  if (!position) {
    position = new WeightedPoolPosition(id);
    position.pool = pool.id;
    position.user = user.toHexString();
    position.liquidity = BigInt.fromI32(0);
    position.save();
    pool.positions = pool.positions.concat([id]);
    pool.save();
    log.info("created new position {} in WeightedPool {}", [id, pool.id]);
  }
  return position;
}

// Before calling this function, make sure that pool.gnoBalance set to the up-to-date value AFTER the swap has been made
export function handleSwap(
  pool: WeightedPool,
  gnoIn: BigInt,
  gnoOut: BigInt
): void {
  const gnoReserves = pool.gnoBalance;
  // to get the GNO reserves before the swap, we add the amount delta
  const gnoReservesBefore = gnoReserves.minus(gnoIn).plus(gnoOut);

  log.info("handle swap in {}, gno reserves before: {}, after: {}", [
    pool.id,
    gnoReservesBefore.toString(),
    gnoReserves.toString(),
  ]);

  // set set previous ratio to current ratio
  if (pool.positions) {
    for (let index = 0; index < pool.positions.length; index++) {
      const position = WeightedPoolPosition.load(pool.positions[index]);
      if (position) {
        const user = loadOrCreateUser(Address.fromString(position.user));

        const voteWeightToSubtract = position.liquidity
          .times(gnoReservesBefore)
          .div(pool.totalSupply);
        const voteWeightToAdd = position.liquidity
          .times(gnoReserves)
          .div(pool.totalSupply);
        user.voteWeight = user.voteWeight
          .plus(voteWeightToAdd)
          .minus(voteWeightToSubtract);
        user.save();

        log.info(
          "updated vote weight of user {} with liquidity {} (-{}, +{})",
          [
            user.id,
            position.liquidity.toString(),
            voteWeightToSubtract.toString(),
            voteWeightToAdd.toString(),
          ]
        );
      }
    }
  }
}

export function handleBalanceChange(
  pool: WeightedPool,
  nextGnoBalance: BigInt
): void {
  const gnoBalance = pool.gnoBalance;

  log.info("handle swap in {}, gno reserves before: {}, after: {}", [
    pool.id,
    gnoBalance.toString(),
    nextGnoBalance.toString(),
  ]);

  // set set previous ratio to current ratio
  if (pool.positions) {
    for (let index = 0; index < pool.positions.length; index++) {
      const position = WeightedPoolPosition.load(pool.positions[index]);
      if (position) {
        const user = loadOrCreateUser(Address.fromString(position.user));

        const voteWeightToSubtract = position.liquidity
          .times(gnoBalance)
          .div(pool.totalSupply);
        const voteWeightToAdd = position.liquidity
          .times(nextGnoBalance)
          .div(pool.totalSupply);
        user.voteWeight = user.voteWeight
          .plus(voteWeightToAdd)
          .minus(voteWeightToSubtract);
        user.save();

        log.info(
          "updated vote weight of user {} with liquidity {} (-{}, +{})",
          [
            user.id,
            position.liquidity.toString(),
            voteWeightToSubtract.toString(),
            voteWeightToAdd.toString(),
          ]
        );
      }
    }
  }
}

export function handleTransfer(
  event: ethereum.Event,
  from: Address,
  to: Address,
  value: BigInt
): void {
  const pool = loadPool(event.address);

  const gnoReserves = pool.gnoBalance;
  log.info("pool loaded: {}, gno reserves: {}, total supply: {}", [
    pool.id,
    gnoReserves.toString(),
    pool.totalSupply.toString(),
  ]);

  const userTo = loadOrCreateUser(to);
  const userFrom = loadOrCreateUser(from);

  log.info("transfer from: {}, to: {}, value: {}", [
    userFrom.id,
    userTo.id,
    value.toString(),
  ]);

  // mint
  if (from.toHexString() == ADDRESS_ZERO.toHexString()) {
    // update total supply
    pool.totalSupply = pool.totalSupply.plus(value);
    pool.save();
    log.info("mint {}, new total supply: {}", [
      pool.id,
      pool.totalSupply.toString(),
    ]);
  }

  // burn
  if (to.toHexString() == ADDRESS_ZERO.toHexString()) {
    pool.totalSupply = pool.totalSupply.minus(value);
    pool.save();
    log.info("burn {}, new total supply: {}", [
      pool.id,
      pool.totalSupply.toString(),
    ]);
  }

  // transfer from
  if (
    from.toHexString() != ADDRESS_ZERO.toHexString() &&
    from.toHexString() != pool.id
  ) {
    const position = loadOrCreatePosition(pool, from);

    // decrease position liquidity and remove it if it gets to zero
    if (position.liquidity.minus(value) == BigInt.fromI32(0)) {
      store.remove("WeightedPoolPosition", position.id);
      pool.positions = arrayRemove(pool.positions, position.id);
      pool.save();
      log.info("removed from position {} of user {}", [
        position.id,
        userFrom.id,
      ]);
    } else {
      position.liquidity = position.liquidity.minus(value);
      position.save();
      log.info("adjusted from position {} of user {}, new liquidity: {}", [
        position.id,
        userFrom.id,
        position.liquidity.toString(),
      ]);
    }

    // decrease vote weight
    const voteWeightToSubtract = value.times(gnoReserves).div(pool.totalSupply);
    userFrom.voteWeight = userFrom.voteWeight.minus(voteWeightToSubtract);
    saveOrRemoveUser(userFrom);
    log.info("subtracted {} from vote weight of {}, for a new total of {}", [
      voteWeightToSubtract.toString(),
      userFrom.id,
      userFrom.voteWeight.toString(),
    ]);
  }

  // transfer to
  if (
    to.toHexString() != ADDRESS_ZERO.toHexString() &&
    to.toHexString() != pool.id
  ) {
    // increase position liquidity
    const position = loadOrCreatePosition(pool, to);
    position.liquidity = position.liquidity.plus(value);
    position.save();
    log.info("adjusted to position of user {}, new liquidity: {}", [
      userTo.id,
      position.liquidity.toString(),
    ]);

    // increase vote weight
    const voteWeightToAdd = value.times(gnoReserves).div(pool.totalSupply);
    userTo.voteWeight = userTo.voteWeight.plus(voteWeightToAdd);
    saveOrRemoveUser(userTo);
    log.info("added {} to vote weight of {}, for a new total of {}", [
      voteWeightToAdd.toString(),
      userTo.id,
      userTo.voteWeight.toString(),
    ]);
  }
}