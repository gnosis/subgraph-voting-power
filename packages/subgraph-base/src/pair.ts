import { BigInt, log, store, Address, Value } from "@graphprotocol/graph-ts";
import { Transfer, Sync } from "../generated/templates/Pair/Pair";

import { ERC20 } from "../generated/templates/Pair/ERC20";
import {
  ADDRESS_ZERO,
  loadAMMPair,
  loadOrCreateAMMPosition,
  loadOrCreateUser,
  gno,
  removeOrSaveUser,
} from "./helpers";
import { AMMPosition, User } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const pair = loadAMMPair(event.address);
  const { value, from, to } = event.params;

  const userTo = loadOrCreateUser(to);
  const userFrom = loadOrCreateUser(from);

  // decrease liquidity and voting weight  of sender
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

    if (position.liquidity.minus(value) == BigInt.fromI32(0)) {
      store.remove("AMMPosition", position.id);
      removeOrSaveUser(userFrom);
      pair.set("positions", Value.fromArray([]));
      pair.save();
    } else {
      position.liquidity = position.liquidity.minus(value);
      position.save();
    }
  }

  // increase liquidity and voting weight of recipient
  if (
    event.params.to.toHexString() != ADDRESS_ZERO.toHexString() &&
    to.toHexString() != pair.id
  ) {
    log.info("Made it into the to check", []);
    // increase position balance
    const position = loadOrCreateAMMPosition(event.address, to);
    position.liquidity = position.liquidity.plus(value);
    position.save();

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
  const pair = loadAMMPair(event.address);
  const otherToken = ERC20.bind(token0 === GNO_ADDRESS ? token1 : token0);
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

function updateVoteWeight(user: User, position: AMMPosition): void {
  const pair = loadAMMPair(Address.fromString(position.pair));
  // subtract vote weight from previous ratio
  let amountToSubtract = pair.previousPrice.times(position.balance);
  user.voteWeight = user.voteWeight.minus(amountToSubtract);
  // add vote weight from current ratio
  user.voteWeight = user.voteWeight.plus(pair.ratio.times(position.balance));

  removeOrSaveUser(user);
}
