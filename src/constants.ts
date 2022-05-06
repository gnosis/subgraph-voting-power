import {
  BigInt,
  BigDecimal,
  Address,
  dataSource,
} from "@graphprotocol/graph-ts";

export const GNO_ADDRESS = Address.fromString(
  dataSource.network() == "mainnet"
    ? "0x6810e776880C02933D47DB1b9fc05908e5386b96"
    : "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"
);

export const ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

export const ONE_GNO = BigInt.fromString("1000000000000000000");

export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);
export const ZERO_BD = BigDecimal.fromString("0");
export const ONE_BD = BigDecimal.fromString("1");
export const BI_18 = BigInt.fromI32(18);

export function arrayRemove(
  array: string[],
  elementToRemove: string
): string[] {
  const index = array.indexOf(elementToRemove);
  return array.slice(0, index).concat(array.slice(index + 1));
}
