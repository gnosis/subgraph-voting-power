import { BigInt, log, store, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  Pair as PairContract,
  Mint,
  Burn,
  Swap,
  Transfer,
  Sync,
} from "../generated/templates/Pair/Pair";

import { ERC20 } from "../generated/templates/Pair/ERC20";
import {
  ADDRESS_ZERO,
  GNO_ADDRESS,
  loadOrCreateAMMPair,
  loadOrCreateAMMPosition,
  loadOrCreateUser,
  gno,
  getGnoInPosition,
  removeOrSaveUser,
  updateVoteWeight,
} from "./helpers";
import { AMMPosition, User } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const pair = loadOrCreateAMMPair(event.address);

  // ignore initial transfers for first adds
  if (
    event.params.to.toHexString() == ADDRESS_ZERO.toString() &&
    event.params.value.equals(BigInt.fromI32(1000))
  ) {
    return;
  }

  // user stats
  const from = event.params.from;
  const to = event.params.to;

  const userTo = loadOrCreateUser(to);
  const userFrom = loadOrCreateUser(from);

  //const pairContract = PairContract.bind(event.address);

  // liquidity token amount being transferred
  let value = event.params.value;

  // mint
  if (from.toHexString() == ADDRESS_ZERO.toString()) {
    // update total supply
    pair.totalSupply = pair.totalSupply.plus(value);
    // add lp & update vote weight
    if (!pair.lps.includes(userTo.id) && value > BigInt.fromI32(0)) {
      pair.lps.push(userTo.id);
      log.error("pair.lps.push({})", [userTo.id]);
      const position = loadOrCreateAMMPosition(
        Address.fromString(pair.id),
        Address.fromString(userTo.id)
      );
      log.error("successfully created AMM position", []);
      position.balance = position.balance.plus(value);
      position.save;

      userTo.voteWeight = userTo.voteWeight.plus(
        getGnoInPosition(position.balance, pair)
      );
      log.error("successfully updated vote weight", []);
      removeOrSaveUser(userTo.id);
    }
    pair.save();
  }

  // burn
  if (
    event.params.to.toHexString() == ADDRESS_ZERO.toString() &&
    event.params.from.toHexString() == pair.id
  ) {
    pair.totalSupply = pair.totalSupply.minus(value);
    pair.gnoReserves = gno.balanceOf(Address.fromString(pair.id));

    pair.save();
  }

  // transfer from
  if (
    from.toHexString() != ADDRESS_ZERO.toString() &&
    from.toHexString() != pair.id
  ) {
    const position = loadOrCreateAMMPosition(event.address, from);
    position.balance = position.balance.minus(value);
    if (position.balance == BigInt.fromI32(0)) {
      const lpsIndex = pair.lps.indexOf(userFrom.id);
      pair.lps.splice(lpsIndex, 1);
      updateVoteWeight(userFrom, position);
      store.remove("AMMPosition", position.id);
    } else {
      position.save;
      updateVoteWeight(userFrom, position);
    }
    // TODO account for deleted position

    // alternative
    // entry.liquidityTokenBalance = pairContract.balanceOf(
    //   from
    // );
  }

  // transfer to
  if (
    event.params.to.toHexString() != ADDRESS_ZERO.toString() &&
    to.toHexString() != pair.id
  ) {
    const position = loadOrCreateAMMPosition(event.address, to);
    position.balance = position.balance.plus(value);
    updateVoteWeight(userTo, position);
    // alternative
    // entry.liquidityTokenBalance = convertTokenToDecimal(
    //   pairContract.balanceOf(to),
    //   BI_18
    // );
    position.save();
  }
}

export function handleSync(event: Sync): void {
  const pair = loadOrCreateAMMPair(event.address);
  pair.gnoReserves = gno.balanceOf(event.address);
  // gno.balanceOf(pair) / pair.totalSupply()
  pair.ratio = pair.gnoReserves.div(ERC20.bind(event.address).totalSupply());
  for (let index = 0; index < pair.lps.length; index++) {
    const user = loadOrCreateUser(
      Address.fromString(pair.lps[index].toString())
    );
    log.error("User: {}\nPair: {}", [user.id, pair.id]);

    const position = loadOrCreateAMMPosition(
      event.address,
      Address.fromString(user.id)
    );

    // const position = new AMMPosition(pair.id.concat("-").concat(user.id));
    log.error("Position: {}", [position.id]);

    updateVoteWeight(user, position);
  }

  // set set previous ratio to current ratio
  pair.previousRatio = pair.ratio;
  pair.save();
}

// export function handleMint(event: Mint): void {
//   const pair = loadOrCreateAMMPair(event.address);
//   pair.mints += 1;
//   pair.save();
// }

// export function handleBurn(event: Burn): void {
//   const pair = loadOrCreateAMMPair(event.address);
//   pair.burns += 1;
//   pair.save();
// }

// export function handleSwap(event: Swap): void {
//   const pair = loadOrCreateAMMPair(event.address);
//   pair.swaps += 1;
//   pair.save();
// }
