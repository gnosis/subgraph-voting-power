/* eslint-disable prefer-const */
import {
  log,
  BigInt,
  BigDecimal,
  Address,
  store,
  Bytes,
  dataSource,
} from "@graphprotocol/graph-ts";
import { AMMPair, AMMPosition, User } from "../generated/schema";
import { ERC20 } from "../generated/templates/Pair/ERC20";
import { Pair } from "../generated/templates";

export const GNO_ADDRESS = Address.fromString(
  dataSource.network() === "mainnet"
    ? "0x6810e776880C02933D47DB1b9fc05908e5386b96"
    : "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"
);

export const gno = ERC20.bind(GNO_ADDRESS);

export const ADDRESS_ZERO = Address.fromHexString(
  "0x0000000000000000000000000000000000000000"
);

export const ONE_GNO = BigInt.fromString("1000000000000000000");

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");
export let BI_18 = BigInt.fromI32(18);

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString("1000000000000000000");
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString());
  const zero = parseFloat(ZERO_BD.toString());
  if (zero == formattedVal) {
    return true;
  }
  return false;
}

export function isNullEthValue(value: string): boolean {
  return (
    value ==
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  );
}

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

export function loadOrCreateAMMPosition(
  pair: Address,
  user: Address
): AMMPosition {
  const id = pair
    .toHexString()
    .concat("-")
    .concat(user.toHex());
  let entry = AMMPosition.load(id);
  if (entry === null) {
    entry = new AMMPosition(id);
    entry.pair = pair.toHex();
    entry.user = user.toHex();
    entry.liquidity = ZERO_BI;
    // entry;
    entry.save();
  }

  return entry;
}

export function loadAMMPair(address: Address): AMMPair {
  const id = address.toHexString();
  return AMMPair.load(id);
}

export function createAMMPair(
  address: Address,
  token0: Address,
  token1: Address
): AMMPair {
  const id = address.toHexString();
  const otherToken = ERC20.bind(token0 === GNO_ADDRESS ? token1 : token0);
  const entry = new AMMPair(id);
  entry.price = gno
    .balanceOf(Address.fromString(id))
    .toBigDecimal()
    .div(otherToken.balanceOf(Address.fromString(id)).toBigDecimal());
  entry.previousPrice = entry.price;
  entry.save();

  return entry;
}
