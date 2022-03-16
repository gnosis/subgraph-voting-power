import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/ds-mgno/ERC20";
import {
  loadOrCreateUser,
  ADDRESS_ZERO,
  removeOrSaveUser,
} from "../../subgraph-base/src/helpers";

export const DEPOSIT_ADDRESS = Address.fromString(
  "0x0B98057eA310F4d31F2a452B414647007d1645d9"
);

export const MGNO_PER_GNO = BigInt.fromString("32");

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;
  const value = event.params.value;

  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = loadOrCreateUser(from);
    userFrom.mgno = userFrom.mgno.minus(value);
    userFrom.voteWeight = userFrom.voteWeight.minus(value.div(MGNO_PER_GNO));
    removeOrSaveUser(userFrom);
  }

  if (
    to.toHexString() != ADDRESS_ZERO.toHexString() &&
    to.toHexString() != DEPOSIT_ADDRESS.toHexString()
  ) {
    const userTo = loadOrCreateUser(to);
    userTo.mgno = userTo.mgno.plus(value);
    userTo.voteWeight = userTo.voteWeight.plus(value.div(MGNO_PER_GNO));
    userTo.save();
  }
}
