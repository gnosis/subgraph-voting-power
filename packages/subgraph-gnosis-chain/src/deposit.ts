import { BigInt } from "@graphprotocol/graph-ts";
import { DepositEvent } from "../generated/ds-deposit/SBCDepositContract";
import { loadOrCreateUser } from "./helpers";

const ONE_GNO = BigInt.fromString("1000000000000000000");

export function handleDeposit(event: DepositEvent): void {
  const user = event.transaction.from;

  const entry = loadOrCreateUser(user);
  entry.deposit = entry.deposit.plus(ONE_GNO);
  entry.voteWeight = entry.voteWeight.plus(ONE_GNO);
  entry.save();
}
