import {
  log,
  BigInt,
  BigDecimal,
  Address,
  store,
  dataSource,
  ethereum,
} from "@graphprotocol/graph-ts";
import { User, WeightedPool, WeightedPoolPosition } from "../generated/schema";

export const GNO_ADDRESS = Address.fromString(
  dataSource.network() == "mainnet"
    ? "0x6810e776880C02933D47DB1b9fc05908e5386b96"
    : "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"
);

export const ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

export const ONE_GNO = BigInt.fromString("1000000000000000000");

export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);
export const ZERO_BD = BigDecimal.fromString("0");
export const ONE_BD = BigDecimal.fromString("1");
export const BI_18 = BigInt.fromI32(18);

export function loadOrCreateUser(address: Address): User {
  const id = address.toHexString();
  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.voteWeight = BigInt.fromI32(0);
    user.gno = BigInt.fromI32(0);
    user.mgno = BigInt.fromI32(0);
    user.lgno = BigInt.fromI32(0);
    user.sgno = BigInt.fromI32(0);
    user.deposit = BigInt.fromI32(0);
    user.balancerInternalGno = BigInt.fromI32(0);
    if (id != ADDRESS_ZERO.toHexString()) {
      user.save();
      log.info("created user {}", [id]);
    }
  }
  return user;
}

export function removeOrSaveUser(user: User): void {
  if (user) {
    if (user.voteWeight == BigInt.fromI32(0)) {
      store.remove("User", user.id);
      log.info("removed user {}", [user.id]);
    } else {
      user.save();
    }
  }
}

export function updatePoolPositionsAfterSwap(
  event: ethereum.Event,
  id: string,
  gnoIn: BigInt,
  gnoOut: BigInt
) {
  const pool = WeightedPool.load(id);
  if (!pool) {
    log.warning(
      "Weighted pool with id {} could not be loaded. Trying to handle {}#{}",
      [
        id,
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }

  // Swap() is emitted after Sync(), so the balance should be up to date
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

export function updatePoolPositionsAfterTransfer(
  event: ethereum.Event,
  id: string,
  from: Address,
  to: Address,
  value: BigInt
): void {
  //const id = event.address.toHexString();
  const pool = WeightedPool.load(id);
  if (!pool) {
    log.warning(
      "Weighted pool with id {} could not be loaded. Trying to handle {}#{}",
      [
        id,
        event.transaction.hash.toHexString(),
        event.transactionLogIndex.toString(),
      ]
    );
    return;
  }

  const gnoReserves = pool.gnoBalance;
  log.info("pool loaded: {}, gno reserves: {}, total supply: {}", [
    pool.id,
    gnoReserves.toString(),
    pool.totalSupply.toString(),
  ]);

  // // user stats
  // const from = event.params.from;
  // const to = event.params.to;

  const userTo = loadOrCreateUser(to);
  const userFrom = loadOrCreateUser(from);

  // liquidity token amount being transferred
  //let value = event.params.value;
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
    removeOrSaveUser(userFrom);
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
    const position = loadOrCreateWeightedPoolPosition(event.address, to);
    position.liquidity = position.liquidity.plus(value);
    position.save();
    log.info("adjusted to position of user {}, new liquidity: {}", [
      userTo.id,
      position.liquidity.toString(),
    ]);

    // increase vote weight
    const voteWeightToAdd = value.times(gnoReserves).div(pool.totalSupply);
    userTo.voteWeight = userTo.voteWeight.plus(voteWeightToAdd);
    removeOrSaveUser(userTo);
    log.info("added {} to vote weight of {}, for a new total of {}", [
      voteWeightToAdd.toString(),
      userTo.id,
      userTo.voteWeight.toString(),
    ]);
  }
}

function loadOrCreateWeightedPoolPosition(
  poolAddress: Address,
  user: Address
): WeightedPoolPosition {
  const pool = WeightedPool.load(poolAddress.toHexString());
  if (!pool)
    throw new Error(`Could not find pool ${poolAddress.toHexString()}`);
  const id = poolAddress
    .toHexString()
    .concat("-")
    .concat(user.toHexString());
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

function arrayRemove(array: string[], elementToRemove: string): string[] {
  const index = array.indexOf(elementToRemove);
  return array.slice(0, index).concat(array.slice(index + 1));
}
