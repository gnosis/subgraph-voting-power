import { Address, BigInt } from '@graphprotocol/graph-ts';

import { VotingPower } from '../generated/schema';

export function increase(address: Address, amount: BigInt): void {
  const id = address.toHex();
  const entry = loadOrCreate(id, address);
  entry.balance = entry.balance.plus(amount);
  entry.save();
}

export function decrease(address: Address, amount: BigInt): void {
  const id = address.toHex();
  const entry = loadOrCreate(id, address);
  entry.balance = entry.balance.minus(amount);
  entry.save();
}

function loadOrCreate(id: string, address: Address): VotingPower {
  let entry = VotingPower.load(id);
  if (!entry) {
    entry = new VotingPower(id);
    entry.address = address;
    entry.balance = BigInt.fromI32(0);
  }
  return entry;
}
