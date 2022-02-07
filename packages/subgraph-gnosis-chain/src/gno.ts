import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Transfer, Burn, Mint } from '../generated/ds-gno/GNO';

import { GNO } from '../generated/schema';

import { increase as increasePower } from './votingPower';
import { decrease as decreasePower } from './votingPower';

// const GNOAddress = Address.fromHexString(
//   '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb'
// );

// const GENESIS_ADDRESS = '0x0000000000000000000000000000000000000000';

export function handleTransfer(event: Transfer): void {
  increase(event);
  decrease(event);
}

export function handleBurn(event: Burn): void {
  // TODO
}

export function handleMint(event: Mint): void {
  // TODO
}

function increase(event: Transfer): void {
  handle(event, event.params.from);
  increasePower(event.params.from, event.params.value);
}

function decrease(event: Transfer): void {
  handle(event, event.params.to);
  decreasePower(event.params.to, event.params.value);
}

function handle(event: Transfer, target: Address): void {
  const address = target;
  const amount = event.params.value;

  const id = address.toHexString();

  let entry = GNO.load(address.toHex());
  if (!entry) {
    entry = new GNO(id);
    entry.address = address;
    entry.balance = BigInt.fromI32(0);
  }

  entry.balance = entry.balance.plus(amount);
  entry.block = event.block.number;
  entry.modified = event.block.timestamp;
  entry.transaction = event.transaction.hash;

  entry.save();
}
