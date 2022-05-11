import { DepositEvent } from "../generated-gc/ds-deposit/SBCDepositContract";
import { loadOrCreate as loadOrCreateUser } from "./helpers/user";
import { ONE_GNO } from "./constants";

export function handleDeposit(event: DepositEvent): void {
  const user = event.transaction.from;

  const entry = loadOrCreateUser(user);
  entry.deposit = entry.deposit.plus(ONE_GNO);
  entry.voteWeight = entry.voteWeight.plus(ONE_GNO);
  entry.save();
}
