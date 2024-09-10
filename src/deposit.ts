import { DepositEvent } from "../generated-gc/ds-deposit/SBCDepositContract";
import { loadOrCreate as loadOrCreateUser } from "./helpers/user";
import { ONE_GNO } from "./constants";
import { Address, Bytes } from "@graphprotocol/graph-ts";

// HANDLE FOR DEPOSIT, NEED FURTHER TESTS
export function handleDeposit(event: DepositEvent): void {
  // const withdrawalCredentials = event.params.withdrawal_credentials;

  // if (withdrawalCredentials.length != 32) {
  //   return;
  // }

  // const addressBytes = withdrawalCredentials.subarray(12, 32);
  // const userAddress = Address.fromBytes(Bytes.fromUint8Array(addressBytes));

  // const entry = loadOrCreateUser(userAddress);
  // entry.deposit = entry.deposit.plus(ONE_GNO);
  // entry.voteWeight = entry.voteWeight.plus(ONE_GNO);
  // entry.save();
}
