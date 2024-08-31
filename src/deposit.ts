import { DepositEvent } from "../generated-gc/ds-deposit/SBCDepositContract";
import { loadOrCreate as loadOrCreateUser } from "./helpers/user";
import { ONE_GNO } from "./constants";
import { Address, Bytes } from "@graphprotocol/graph-ts";

export function handleDeposit(event: DepositEvent): void {
  const withdrawalCredentials = event.params.withdrawal_credentials;
  const addressBytes = withdrawalCredentials.slice(12) as Bytes;
  const userAddress = Address.fromBytes(addressBytes);

  const entry = loadOrCreateUser(userAddress);
  entry.deposit = entry.deposit.plus(ONE_GNO);
  entry.voteWeight = entry.voteWeight.plus(ONE_GNO);
  entry.save();
}
