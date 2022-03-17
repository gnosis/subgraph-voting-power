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
  log.info("pair loaded: {}", [pair.id]);

  // ignore initial transfers for first adds
  if (
    event.params.to.toHexString() == ADDRESS_ZERO.toHexString() &&
    event.params.value.equals(BigInt.fromI32(1000))
  ) {
    return;
  }
  log.info("past initial transfer event", []);

  // user stats
  const from = event.params.from;
  const to = event.params.to;

  const userTo = loadOrCreateUser(to);
  const userFrom = loadOrCreateUser(from);

  // liquidity token amount being transferred
  let value = event.params.value;
  log.info("\nFrom: {}\nTo: {}\nValue: {}", [
    userFrom.id,
    userTo.id,
    value.toString(),
  ]);

  // mint
  if (
    from.toHexString() == ADDRESS_ZERO.toHexString() &&
    value.gt(BigInt.fromI32(0))
  ) {
    log.info("made it past the mint check", []);
    // update total supply
    pair.totalSupply = pair.totalSupply.plus(value);
    pair.gnoReserves = gno.balanceOf(Address.fromString(pair.id));
    if (pair.ratio == BigInt.fromI32(0)) {
      pair.ratio = pair.gnoReserves.div(pair.totalSupply);
      pair.previousRatio = pair.ratio;
      log.info("set the ratio", []);
    }
    pair.save();
  }

  // burn
  if (
    to.toHexString() == ADDRESS_ZERO.toHexString() &&
    from.toHexString() == pair.id
  ) {
    log.info("made it past the burn check", []);
    pair.totalSupply = pair.totalSupply.minus(value);
    pair.gnoReserves = gno.balanceOf(Address.fromString(pair.id));
    pair.save();
    log.info("successfully burned", []);
  }

  // transfer from
  if (
    from.toHexString() != ADDRESS_ZERO.toHexString() &&
    from.toHexString() != pair.id
  ) {
    log.info("made it past the from check", []);
    let position = loadOrCreateAMMPosition(event.address, from);
    log.info("loaded position: {}", [position.id]);
    const voteWeightToSubtract = pair.ratio.times(value);
    userFrom.voteWeight = userFrom.voteWeight.minus(voteWeightToSubtract);
    log.info("subtracted {} from vote weight, for a new total of {}", [
      voteWeightToSubtract.toString(),
      userFrom.voteWeight.toString(),
    ]);

    pair.save();

    if (position.balance.minus(value) == BigInt.fromI32(0)) {
      log.info("made it past the zero balance check", []);
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
    log.info("Made it into the to check", []);
    // increase position balance
    const position = loadOrCreateAMMPosition(event.address, to);
    position.balance = position.balance.plus(value);
    log.info("position balance: {}", [position.balance.toString()]);
    // increase vote weight
    userTo.voteWeight = userTo.voteWeight.plus(pair.ratio.times(value));
    removeOrSaveUser(userTo);
    position.save();
    pair.save();
    position.save();
    log.info("managed to save everything", []);
  }
}

export function handleSync(event: Sync): void {
  log.info("trying to do Sync", []);
  const pair = loadOrCreateAMMPair(event.address);
  log.info("loaded pair: {}", [pair.id]);
  pair.gnoReserves = gno.balanceOf(event.address);
  log.info("gno reserves: {}", [pair.gnoReserves.toString()]);
  // gno.balanceOf(pair) / pair.totalSupply()
  pair.ratio = pair.gnoReserves.div(ERC20.bind(event.address).totalSupply());
  log.info("pair.ratio: {}", [pair.ratio.toString()]);
  const positions = pair.positions;
  log.info("pair.positions: {}", [pair.positions.toString()]);
  pair.previousRatio = pair.ratio;
  log.info("pair.previousRatio: {}", [pair.previousRatio.toString()]);
  pair.save();
  // set set previous ratio to current ratio
  if (positions) {
    log.info("inside the Sync if statement", []);
    for (let index = 0; index < positions.length; index++) {
      log.info("start for loop", []);
      const position = AMMPosition.load(positions[index]);
      log.info("load positions", [positions.toString()]);
      if (position) {
        log.info("Position: {}\nIndex: {}", [position.id, index.toString()]);
        log.info("inside the position check in Sync", []);
        const user = loadOrCreateUser(Address.fromString(position.user));
        // const position = new AMMPosition(pair.id.concat("-").concat(user.id));
        updateVoteWeight(user, position);
        log.info("vote weight updated", []);
        position.save();
        log.info("successfully updated?", []);
      }
    }
  }
}
