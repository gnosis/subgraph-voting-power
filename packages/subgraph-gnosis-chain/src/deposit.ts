import { BigInt } from "@graphprotocol/graph-ts";
import { DepositEvent } from "../generated/ds-deposit/SBCDepositContract";
import { loadOrCreateUser } from "./helpers";

const depositAmount = BigInt.fromString("32000000000000000000");

export function handleDeposit(event: DepositEvent): void {
  const user = event.transaction.from;

  const entry = loadOrCreateUser(user);
  entry.deposit = entry.deposit.plus(depositAmount);
  entry.voteWeight = entry.voteWeight.plus(depositAmount);
  entry.save();
}
