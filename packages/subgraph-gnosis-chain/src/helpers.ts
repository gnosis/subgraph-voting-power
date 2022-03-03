/* eslint-disable prefer-const */
import { log, BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts";
import { AMMPair, AMMPosition, User } from "../generated/schema";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const FACTORY_ADDRESS = "0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7";
export const GNO_ADDRESS = Address.fromString(
  "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"
);

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
    // TODO: address field can probably be removed
    // entry.address = address;
    entry.voteWeight = BigInt.fromI32(0);
    entry.gno = BigInt.fromI32(0);
    entry.mgno = BigInt.fromI32(0);
    entry.lgno = BigInt.fromI32(0);
    entry.deposit = BigInt.fromI32(0);
  }
  return entry;
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
    // TODO address field can probably be removed.
    // entry.address = address;
    entry.burns = 0;
    entry.mints = 0;
    entry.swaps = 0;
    entry.syncs = 0;
  }
  return entry;
}

// export function createUser(address: Address): void {
//   let user = User.load(address.toHexString());
//   if (user === null) {
//     user = new User(address.toHexString());
//     user.usdSwapped = ZERO_BD;
//     user.save();
//   }
// }
