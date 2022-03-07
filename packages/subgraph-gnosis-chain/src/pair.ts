import { BigInt, log, store, Address } from "@graphprotocol/graph-ts";
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
} from "./helpers";
import { AMMPosition, User } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const pair = loadOrCreateAMMPair(event.address);

  // ignore initial transfers for first adds
  if (
    event.params.to.toHexString() == ADDRESS_ZERO &&
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
  if (from.toHexString() == ADDRESS_ZERO) {
    // update total supply
    pair.totalSupply = pair.totalSupply.plus(value);
    // add lp & update vote weight
    if (!pair.lps.includes(to) && value > BigInt.fromI32(0)) {
      pair.lps.push(to);
      userTo.lpIn.push(pair.id);
      const position = new AMMPosition(
        userTo.lpIn[userTo.lpIn.indexOf(pair.id)]
      );
      userTo.voteWeight = userTo.voteWeight.plus(
        getGnoInPosition(position.balance, pair)
      );
      userTo.save();
    }
    pair.save();
  }

  // burn
  if (
    event.params.to.toHexString() == ADDRESS_ZERO &&
    event.params.from.toHexString() == pair.id
  ) {
    pair.totalSupply = pair.totalSupply.minus(value);
    if (userFrom.lpIn.indexOf(pair.id)) {
      const lpInIndex = userFrom.lpIn.indexOf(pair.id);
      const position = new AMMPosition(userFrom.lpIn[lpInIndex]);
      // remove user from lps if balance is 0
      if (position.balance == BigInt.fromI32(0)) {
        const lpsIndex = pair.lps.indexOf(from);
        pair.lps.splice(lpsIndex, 1);
      }
    }

    // update vote weight
    userFrom.voteWeight = userFrom.voteWeight.minus(
      getGnoInPosition(value, pair)
    );
    // remove user if voteWeight is 0
    if (userFrom.voteWeight == BigInt.fromI32(0)) {
      store.remove("User", userFrom.id);
    } else {
      userFrom.save();
    }

    pair.save();
  }

  // transfer from
  if (from.toHexString() != ADDRESS_ZERO && from.toHexString() != pair.id) {
    loadOrCreateUser(from);

    const entry = loadOrCreateAMMPosition(event.address, from);
    entry.balance = entry.balance.minus(value);

    // alternative
    // entry.liquidityTokenBalance = pairContract.balanceOf(
    //   from
    // );

    entry.save();
  }

  // transfer to
  if (
    event.params.to.toHexString() != ADDRESS_ZERO &&
    to.toHexString() != pair.id
  ) {
    loadOrCreateUser(to);
    const entry = loadOrCreateAMMPosition(event.address, to);
    entry.balance = entry.balance.plus(value);

    // alternative
    // entry.liquidityTokenBalance = convertTokenToDecimal(
    //   pairContract.balanceOf(to),
    //   BI_18
    // );
    entry.save();
  }
}

export function handleSync(event: Sync): void {
  const pair = loadOrCreateAMMPair(event.address);
  pair.gnoReserves = gno.balanceOf(event.address);
  pair.ratio = gno
    .balanceOf(event.address)
    .div(ERC20.bind(event.address).balanceOf(event.address));
  for (let index = 0; index < pair.lps.length; index++) {
    const user = new User(pair.lps[index].toString());
    const position = new AMMPosition(pair.id.concat("-").concat(user.id));

    // subtract vote weight from previous ratio
    user.voteWeight = position.balance.minus(
      pair.previousRatio.times(position.balance)
    );
    // add vote weight from current ratio
    user.voteWeight = position.balance.plus(pair.ratio.times(position.balance));

    // save changes
    user.save();
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
