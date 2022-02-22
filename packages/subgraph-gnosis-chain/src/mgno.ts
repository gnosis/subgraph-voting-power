import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Transfer } from '../generated/ds-mgno/MGNO';

import { MGNO } from '../generated/schema';

import { increase as increasePower } from './votingPower';
import { decrease as decreasePower } from './votingPower';

// NOTE: this should probably use a subgraph template. copy from gno

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;
  const value = event.params.value;

  writeEntity(event, from, (prevBalance, value) => prevBalance.minus(value));
  decreasePower(from, value.div(BigInt.fromI32(32)));

  writeEntity(event, to, (prevBalance, value) => prevBalance.plus(value));
  increasePower(to, value.div(BigInt.fromI32(32)));
}

function writeEntity(
  event: Transfer,
  address: Address,
  updateBalance: (prevBalance: BigInt, value: BigInt) => BigInt
): void {
  const id = address.toHex();

  let entry = MGNO.load(id);
  if (!entry) {
    entry = new MGNO(id);
    entry.address = address;
    entry.balance = BigInt.fromI32(0);
  }

  entry.balance = updateBalance(entry.balance, event.params.value);
  entry.block = event.block.number;
  entry.modified = event.block.timestamp;
  entry.transaction = event.transaction.hash;

  entry.save();
}
