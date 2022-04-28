import { DepositEvent } from "../generated/ds-deposit/SBCDepositContract";
import { loadOrCreateUser, ONE_GNO } from "../../subgraph-base/src/helpers";

export function handleDeposit(event: DepositEvent): void {
  const user = event.transaction.from;

  const entry = loadOrCreateUser(user);
  entry.deposit = entry.deposit.plus(ONE_GNO);
  entry.voteWeight = entry.voteWeight.plus(ONE_GNO);
  entry.save();
}
