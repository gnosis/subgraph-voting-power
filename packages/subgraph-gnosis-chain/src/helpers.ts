/* eslint-disable prefer-const */
import { log, BigInt, Address, store } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";

export const ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

export function loadOrCreateUser(address: Address): User {
  const id = address.toHexString();
  let entry = User.load(id);
  if (!entry) {
    entry = new User(id);
    entry.voteWeight = BigInt.fromI32(0);
    entry.gno = BigInt.fromI32(0);
    entry.mgno = BigInt.fromI32(0);
    entry.lgno = BigInt.fromI32(0);
    entry.deposit = BigInt.fromI32(0);
    if (id != ADDRESS_ZERO.toHexString()) {
      entry.save();
    }
  }
  return entry;
}

export function removeOrSaveUser(user: User): void {
  if (user) {
    if (user && user.voteWeight == BigInt.fromI32(0)) {
      store.remove("User", user.id);
    } else {
      user.save();
    }
  }
}
