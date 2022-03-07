/* eslint-disable prefer-const */
import {
  log,
  BigInt,
  BigDecimal,
  Address,
  store,
} from "@graphprotocol/graph-ts";
import { AMMPair, AMMPosition, User } from "../generated/schema";
import { ERC20 } from "../generated/templates/Pair/ERC20";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const FACTORY_ADDRESS = "0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7";
export const GNO_ADDRESS = Address.fromString(
  "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"
);
export const gno = ERC20.bind(GNO_ADDRESS);

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");
export let ONE_BD = BigDecimal.fromString("1");
export let BI_18 = BigInt.fromI32(18);

// export let factoryContract = FactoryContract.bind(
//   Address.fromString(FACTORY_ADDRESS)
// );

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

export function convertTokenToDecimal(
  tokenAmount: BigInt,
  exchangeDecimals: BigInt
): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
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
  const id = address.toHex();
  let entry = User.load(id);
  if (!entry) {
    entry = new User(id);
    entry.voteWeight = BigInt.fromI32(0);
    entry.gno = BigInt.fromI32(0);
    entry.mgno = BigInt.fromI32(0);
    entry.lgno = BigInt.fromI32(0);
    entry.deposit = BigInt.fromI32(0);
  }
  return entry;
}

export function removeOrSaveUser(id: string): void {
  let user = User.load(id);
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
    entry.balance = ZERO_BI;
    entry.save();
  }

  return entry;
}

export function loadOrCreateAMMPair(address: Address): AMMPair {
  const id = address.toHex();
  let entry = AMMPair.load(id);
  if (!entry) {
    entry = new AMMPair(id);
    entry.totalSupply = ERC20.bind(Address.fromString(id)).totalSupply();
    entry.gnoReserves = gno.balanceOf(Address.fromString(id));
    entry.previousRatio = BigInt.fromI32(0);
    entry.ratio = entry.gnoReserves.div(entry.totalSupply);
    entry.lps = [];
  }
  return entry;
}

export function getGnoInPosition(value: BigInt, pair: AMMPair): BigInt {
  // pair.balanceOf(user) / pair.totalSupply() * gno.balanceOf(pair)
  // or
  // value * ratio * gno.balanceOf(pair)
  return value
    .times(pair.ratio)
    .div(gno.balanceOf(Address.fromString(pair.id)));
}

// export function createUser(address: Address): void {
//   let user = User.load(address.toHexString());
//   if (user === null) {
//     user = new User(address.toHexString());
//     user.usdSwapped = ZERO_BD;
//     user.save();
//   }
// }
