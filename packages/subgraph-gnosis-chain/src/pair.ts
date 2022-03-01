import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  Pair as PairContract,
  Mint,
  Burn,
  Swap,
  Transfer,
  Sync,
} from '../generated/templates/Pair/Pair';

import { ERC20 } from '../generated/templates/Pair/ERC20';
import {
  ADDRESS_ZERO,
  GNO_ADDRESS,
  loadOrCreateAMMPair,
  loadOrCreateAMMPosition,
  loadOrCreateUser,
} from './helpers';

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

  //const pairContract = PairContract.bind(event.address);

  // liquidity token amount being transfered
  let value = event.params.value;

  // mint
  if (from.toHexString() == ADDRESS_ZERO) {
    // update total supply
    pair.totalSupply = pair.totalSupply.plus(value);
    pair.save();
  }

  // burn
  if (
    event.params.to.toHexString() == ADDRESS_ZERO &&
    event.params.from.toHexString() == pair.id
  ) {
    pair.totalSupply = pair.totalSupply.minus(value);
    pair.save();
  }

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
  const contract = ERC20.bind(GNO_ADDRESS);
  const pair = loadOrCreateAMMPair(event.address);
  pair.syncs += 1;
  pair.gnoReserves = contract.balanceOf(event.address);
  pair.save();
}

export function handleMint(event: Mint): void {
  const pair = loadOrCreateAMMPair(event.address);
  pair.mints += 1;
  pair.save();
}

export function handleBurn(event: Burn): void {
  const pair = loadOrCreateAMMPair(event.address);
  pair.burns += 1;
  pair.save();
}

export function handleSwap(event: Swap): void {
  const pair = loadOrCreateAMMPair(event.address);
  pair.swaps += 1;
  pair.save();
}
