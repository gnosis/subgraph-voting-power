import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Balance } from '../generated/schema';

export function loadOrCreate(address: Address): Balance {
  const id = address.toHex();
  let entry = Balance.load(id);
  if (!entry) {
    entry = new Balance(id);
    entry.address = address;
    entry.gno = BigInt.fromI32(0);
    entry.mgno = BigInt.fromI32(0);
    entry.lgno = BigInt.fromI32(0);
    entry.deposit = BigInt.fromI32(0);
    entry.pools = [];
  }
  return entry;
}
