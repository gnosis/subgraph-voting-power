import {
  log,
  BigInt,
  BigDecimal,
  Address,
  store,
  dataSource,
} from "@graphprotocol/graph-ts";
import { AMMPair, AMMPosition, User } from "../generated/schema";
import { ERC20 } from "../generated/templates/Pair/ERC20";

export const GNO_ADDRESS = Address.fromString(
  dataSource.network() == "mainnet"
    ? "0x6810e776880C02933D47DB1b9fc05908e5386b96"
    : "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"
);

export const gno = ERC20.bind(GNO_ADDRESS);

export const ADDRESS_ZERO = Address.fromHexString(
  "0x0000000000000000000000000000000000000000"
);

export const ONE_GNO = BigInt.fromString("1000000000000000000");

const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);
export const ZERO_BD = BigDecimal.fromString("0");
export const ONE_BD = BigDecimal.fromString("1");
export const BI_18 = BigInt.fromI32(18);

export function loadOrCreateUser(address: Address): User {
  const id = address.toHexString();
  let entry = User.load(id);
  if (entry == null) {
    entry = new User(id);
    entry.voteWeight = BigInt.fromI32(0);
    entry.gno = BigInt.fromI32(0);
    entry.mgno = BigInt.fromI32(0);
    entry.lgno = BigInt.fromI32(0);
    entry.deposit = BigInt.fromI32(0);
    if (id != ADDRESS_ZERO.toHexString() && !AMMPair.load(id)) {
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
