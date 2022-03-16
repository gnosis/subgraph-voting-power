import { BigInt, Address } from "@graphprotocol/graph-ts";

export const DEPOSIT_ADDRESS = Address.fromString(
  "0x0B98057eA310F4d31F2a452B414647007d1645d9"
);

export const ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
export const USER1_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);
export const USER2_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000002"
);

export const data = "0x00";

export const MGNO_PER_GNO = BigInt.fromString("32");
export const ONE_GNO = BigInt.fromString("1000000000000000000");
