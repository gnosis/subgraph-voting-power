import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Transfer } from '../generated/ds-gno/GNO';

import { GNO } from '../generated/schema';

import { increase as increasePower } from './votingPower';
import { decrease as decreasePower } from './votingPower';

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  writeEntity(event, from, (prevBalance, value) => prevBalance.minus(value));
  decreasePower(from, event.params.value);
  writeEntity(event, to, (prevBalance, value) => prevBalance.plus(value));
  increasePower(to, event.params.value);
}

function writeEntity(
  event: Transfer,
  address: Address,
  updateBalance: (prevBalance: BigInt, value: BigInt) => BigInt
): void {
  const id = address.toHex();

  let entry = GNO.load(id);
  if (!entry) {
    entry = new GNO(id);
    entry.address = address;
    entry.balance = BigInt.fromI32(0);
  }

  entry.balance = updateBalance(entry.balance, event.params.value);
  // entry.block = event.block.number;
  // entry.modified = event.block.timestamp;
  // entry.transaction = event.transaction.hash;

  entry.save();
}
