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

const BIGINT_MAX = BigInt.fromUnsignedBytes(
  Bytes.fromHexString("ff".repeat(32)) // 256 bits = 32 * ff byte
);

export function loadOrCreateAMMPosition(
  pair: Address,
  user: Address,
  lowerBound: BigInt = BigInt.zero(),
  upperBound: BigInt = BIGINT_MAX
): AMMPosition {
  const id = pair
    .toHexString()
    .concat("-")
    .concat(user.toHexString())
    .concat("-")
    .concat(lowerBound.toHexString())
    .concat("-")
    .concat(upperBound.toHexString());
  let entry = AMMPosition.load(id);
  if (entry === null) {
    entry = new AMMPosition(id);
    entry.pair = pair.toHexString();
    entry.user = user.toHexString();
    entry.balance = ZERO_BI;
    // entry;
    entry.save();
  }

  return entry;
}

export function loadOrCreateAMMPair(address: Address): AMMPair {
  const id = address.toHexString();
  let entry = AMMPair.load(id);
  log.info("pair: {}", [entry.id || "null"]);
  if (entry == null) {
    Pair.create(address);
    log.info("pair created", []);
    entry = new AMMPair(id);
    entry.totalSupply = BigInt.fromI32(0);
    entry.gnoReserves = gno.balanceOf(Address.fromString(id));
    entry.previousRatio = BigInt.fromI32(0);
    entry.ratio = BigInt.fromI32(0);
    entry.save();
    log.info("pair saved: {}", [entry.id]);
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

export function updateVoteWeight(user: User, position: AMMPosition): void {
  const pair = loadOrCreateAMMPair(Address.fromString(position.pair));
  // subtract vote weight from previous ratio
  let amountToSubtract = pair.previousRatio.times(position.balance);
  user.voteWeight = user.voteWeight.minus(amountToSubtract);
  // add vote weight from current ratio
  user.voteWeight = user.voteWeight.plus(pair.ratio.times(position.balance));

  removeOrSaveUser(user);
}

// export function createUser(address: Address): void {
//   let user = User.load(address.toHexString());
//   if (user === null) {
//     user = new User(address.toHexString());
//     user.usdSwapped = ZERO_BD;
//     user.save();
//   }
// }
