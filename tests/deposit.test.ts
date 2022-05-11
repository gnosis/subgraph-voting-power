import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handleDeposit } from "../src/deposit";
import { DepositEvent } from "../generated-gc/ds-deposit/SBCDepositContract";
import { newMockEvent } from "matchstick-as";
import { USER1_ADDRESS } from "./helpers";
import { ONE_GNO } from "../src/constants";

function createDepositEvent(from: string): DepositEvent {
  let mockEvent = newMockEvent();

  let newTransferEvent = new DepositEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    new ethereum.Transaction(
      mockEvent.transaction.hash,
      mockEvent.transaction.index,
      Address.fromString(from),
      mockEvent.transaction.to,
      mockEvent.transaction.value,
      mockEvent.transaction.gasLimit,
      mockEvent.transaction.gasPrice,
      mockEvent.transaction.input,
      mockEvent.transaction.nonce
    ),
    mockEvent.parameters
  );

  return newTransferEvent;
}

test("Deposit increases the deposit amount of the sender by 1 GNO", () => {
  clearStore();
  handleDeposit(createDepositEvent(USER1_ADDRESS.toHexString()));
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "deposit",
    ONE_GNO.toString()
  );
});

test("Deposit increases the vote weight of the sender by 1 GNO", () => {
  clearStore();
  handleDeposit(createDepositEvent(USER1_ADDRESS.toHexString()));
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.toString()
  );
});
