import { log, BigInt, Address, store } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";
import { ADDRESS_ZERO } from "../constants";

export function loadOrCreate(address: Address): User {
  const id = address.toHexString();
  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.voteWeight = BigInt.fromI32(0);
    user.gno = BigInt.fromI32(0);
    user.lgno = BigInt.fromI32(0);
    user.sgno = BigInt.fromI32(0);
    user.osgnoShare = BigInt.fromI32(0);
    user.osgnoAsset = BigInt.fromI32(0);
    user.deposit = BigInt.fromI32(0);
    if (id != ADDRESS_ZERO.toHexString()) {
      user.save();
      log.info("created user {}", [id]);
    }
  }
  return user;
}

export function saveOrRemove(user: User): void {
  if (user) {
    if (user.voteWeight == BigInt.fromI32(0)) {
      store.remove("User", user.id);
      log.info("removed user {}", [user.id]);
    } else {
      user.save();
    }
  }
}
