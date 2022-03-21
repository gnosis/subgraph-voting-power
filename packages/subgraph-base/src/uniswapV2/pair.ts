import { BigInt, log, store, Address, Value } from "@graphprotocol/graph-ts";
import { Transfer, Sync, Swap } from "../../generated/templates/Pair/Pair";

import { ERC20 } from "../../generated/templates/Pair/ERC20";
import { ADDRESS_ZERO, loadOrCreateUser, removeOrSaveUser } from "../helpers";
import {
  User,
  WeightedPool,
  WeightedPoolPosition,
} from "../../generated/schema";

export function handleTransfer(event: Transfer): void {
  const pool = loadWeightedPool(event.address);
  const gnoReserves = User.load(pool.id).gno;
  log.info("pool loaded: {}, gno reserves: {}, total supply: {}", [
    pool.id,
    gnoReserves.toString(),
    pool.totalSupply.toString(),
  ]);

  // ignore initial transfers for first adds
  // if (
  //   event.params.to.toHexString() == ADDRESS_ZERO.toHexString() &&
  //   event.params.value.equals(BigInt.fromI32(1000))
  // ) {
  //   return;
  // }

  // user stats
  const from = event.params.from;
  const to = event.params.to;

  const userTo = loadOrCreateUser(to);
  const userFrom = loadOrCreateUser(from);

  // liquidity token amount being transferred
  let value = event.params.value;
  log.info("transfer from: {}, to: {}, value: {}", [
    userFrom.id,
    userTo.id,
    value.toString(),
  ]);

  // mint
  if (
    from.toHexString() == ADDRESS_ZERO.toHexString() &&
    value.gt(BigInt.fromI32(0))
  ) {
    // update total supply
    pool.totalSupply = pool.totalSupply.plus(value);
    pool.save();
    log.info("mint {}, new total supply: {}", [
      pool.id,
      pool.totalSupply.toString(),
    ]);
  }

  // burn
  if (
    to.toHexString() == ADDRESS_ZERO.toHexString() &&
    from.toHexString() == pool.id
  ) {
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
    const position = loadOrCreateWeightedPoolPosition(event.address, from);

    // decrease position liquidity and remove it if it gets to zero
    if (position.liquidity.minus(value) == BigInt.fromI32(0)) {
      store.remove("WeightedPoolPosition", position.id);
      pool.set("positions", Value.fromArray([]));
      pool.save();
      log.info("removed from position {} of user {}", [
        position.id,
        userFrom.id,
      ]);
    } else {
      position.liquidity = position.liquidity.minus(value);
      removeOrSaveUser(userFrom);
      position.save();
      log.info("adjusted from position {} of user {}, new liquidity: {}", [
        position.id,
        userFrom.id,
        position.liquidity.toString(),
      ]);
    }

    // decrease vote weight
    const voteWeightToSubtract = value
      .times(pool.gnoReserves)
      .div(pool.totalSupply);
    userFrom.voteWeight = userFrom.voteWeight.minus(voteWeightToSubtract);
    removeOrSaveUser(userFrom);
    log.info("subtracted {} from vote weight of {}, for a new total of {}", [
      voteWeightToSubtract.toString(),
      userFrom.id,
      userFrom.voteWeight.toString(),
    ]);
  }

  // transfer to
  if (
    event.params.to.toHexString() != ADDRESS_ZERO.toHexString() &&
    to.toHexString() != pool.id
  ) {
    // increase position liquidity
    const position = loadOrCreateWeightedPoolPosition(event.address, to);
    position.liquidity = position.liquidity.plus(value);
    position.save();
    log.info("adjusted to position of user {}, new liquidity: {}", [
      userTo.id,
      position.liquidity.toString(),
    ]);

    // increase vote weight
    const voteWeightToAdd = value.times(pool.gnoReserves).div(pool.totalSupply);
    userTo.voteWeight = userTo.voteWeight.plus(voteWeightToAdd);
    removeOrSaveUser(userTo);
    log.info("added {} from vote weight of {}, for a new total of {}", [
      voteWeightToAdd.toString(),
      userTo.id,
      userTo.voteWeight.toString(),
    ]);
  }
}

export function handleSwap(event: Swap): void {
  const pool = loadWeightedPool(event.address);

  // swaps don't change LP token total supply, but they do change the GNO reserves and thus the ratio
  const gnoIn = pool.gnoIsFirst
    ? event.params.amount0In
    : event.params.amount1In;
  const gnoOut = pool.gnoIsFirst
    ? event.params.amount0Out
    : event.params.amount1Out;

  // Swap() is emitted after Transfer(), so reading the pool's balance will give us the updated value
  const gnoReserves = User.load(pool.id).gno;
  // to get the GNO reserves before the swap, we add the amount delta
  const gnoReservesBefore = gnoReserves.plus(gnoIn).minus(gnoOut);

  log.info("handle swap in {}, gno reserves before: {}, after: ", [
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
        user.voteWeight.minus(voteWeightToSubtract).plus(voteWeightToAdd);

        log.info("update vote weight of user {} with liquidity {} (-{}, +{})", [
          user.id,
          position.liquidity.toString(),
          voteWeightToSubtract.toString(),
          voteWeightToAdd.toString(),
        ]);

        user.save();
      }
    }
  }
}

function loadOrCreateWeightedPoolPosition(
  pairAddress: Address,
  user: Address
): WeightedPoolPosition {
  const pool = WeightedPool.load(pairAddress.toHexString());
  if (!pool)
    throw new Error(`Could not find pool ${pairAddress.toHexString()}`);
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

function loadWeightedPool(address: Address): WeightedPool {
  const id = address.toHexString();
  const pool = WeightedPool.load(id);
  if (!pool) throw new Error(`WeightedPool with id ${id} not found`);
  return pool;
}
