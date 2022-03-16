import { BigInt, log, store, Address, Value } from "@graphprotocol/graph-ts";
import { Transfer, Sync } from "../generated/templates/Pair/Pair";

import { ERC20 } from "../generated/templates/Pair/ERC20";
import {
  ADDRESS_ZERO,
  loadOrCreateAMMPair,
  loadOrCreateAMMPosition,
  loadOrCreateUser,
  gno,
  removeOrSaveUser,
  updateVoteWeight,
} from "./helpers";
import { AMMPosition, User } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const pair = loadOrCreateAMMPair(event.address);

  // ignore initial transfers for first adds
  if (
    event.params.to.toHexString() == ADDRESS_ZERO.toHexString() &&
    event.params.value.equals(BigInt.fromI32(1000))
  ) {
    return;
  }

  // user stats
  const from = event.params.from;
  const to = event.params.to;

  const userTo = loadOrCreateUser(to);
  const userFrom = loadOrCreateUser(from);

  // liquidity token amount being transferred
  let value = event.params.value;

  // mint
  if (
    from.toHexString() == ADDRESS_ZERO.toHexString() &&
    value.gt(BigInt.fromI32(0))
  ) {
    // update total supply
    pair.totalSupply = pair.totalSupply.plus(value);
    pair.gnoReserves = gno.balanceOf(Address.fromString(pair.id));
    if (pair.ratio == BigInt.fromI32(0)) {
      pair.ratio = pair.gnoReserves.div(pair.totalSupply);
      pair.previousRatio = pair.ratio;
    }
    pair.save();
  }

  // burn
  if (
    to.toHexString() == ADDRESS_ZERO.toHexString() &&
    from.toHexString() == pair.id
  ) {
    pair.totalSupply = pair.totalSupply.minus(value);
    pair.gnoReserves = gno.balanceOf(Address.fromString(pair.id));
    pair.save();
  }

  // transfer from
  if (
    from.toHexString() != ADDRESS_ZERO.toHexString() &&
    from.toHexString() != pair.id
  ) {
    let position = loadOrCreateAMMPosition(event.address, from);

    const voteWeightToSubtract = pair.ratio.times(value);
    userFrom.voteWeight = userFrom.voteWeight.minus(voteWeightToSubtract);

    pair.save();

    if (position.balance.minus(value) == BigInt.fromI32(0)) {
      store.remove("AMMPosition", position.id);
      removeOrSaveUser(userFrom);
      pair.set("positions", Value.fromArray([]));
      pair.save();
    } else {
      position.balance = position.balance.minus(value);
      removeOrSaveUser(userFrom);
      position.save();
    }
  }

  // transfer to
  if (
    event.params.to.toHexString() != ADDRESS_ZERO.toHexString() &&
    to.toHexString() != pair.id
  ) {
    // increase position balance
    const position = loadOrCreateAMMPosition(event.address, to);
    position.balance = position.balance.plus(value);
    // increase vote weight
    userTo.voteWeight = userTo.voteWeight.plus(pair.ratio.times(value));
    removeOrSaveUser(userTo);
    position.save();
    pair.save();
    position.save();
  }
}

export function handleSync(event: Sync): void {
  const pair = loadOrCreateAMMPair(event.address);
  pair.gnoReserves = gno.balanceOf(event.address);
  // gno.balanceOf(pair) / pair.totalSupply()
  pair.ratio = pair.gnoReserves.div(ERC20.bind(event.address).totalSupply());
  const positions = pair.positions;
  pair.previousRatio = pair.ratio;
  pair.save();
  // set set previous ratio to current ratio
  if (positions) {
    for (let index = 0; index < positions.length; index++) {
      const position = AMMPosition.load(positions[index]);
      if (position) {
        const user = loadOrCreateUser(Address.fromString(position.user));
        // const position = new AMMPosition(pair.id.concat("-").concat(user.id));
        updateVoteWeight(user, position);
        position.save();
      }
    }
  }
}
