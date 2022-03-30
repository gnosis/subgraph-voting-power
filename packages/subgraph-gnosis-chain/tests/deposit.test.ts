import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleDeposit } from "../src/deposit";
import { DepositEvent } from "../generated/ds-deposit/SBCDepositContract";
import { log, newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  ONE_GNO,
  MGNO_PER_GNO,
  DEPOSIT_ADDRESS,
  USER1_ADDRESS,
  USER2_ADDRESS,
  data,
} from "./helpers";

let value = ONE_GNO.times(MGNO_PER_GNO);
let value2x = value.times(BigInt.fromI32(2));

function createDepositEvent(
  from: string,
  to: string,
  value: BigInt,
  data: string
): DepositEvent {
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
  handleDeposit(
    createDepositEvent(
      USER1_ADDRESS.toHexString(),
      DEPOSIT_ADDRESS.toHexString(),
      value,
      data
    )
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "deposit",
    ONE_GNO.toString()
  );
});

test("Deposit increases the vote weight of the sender by 1 GNO", () => {
  clearStore();
  handleDeposit(
    createDepositEvent(
      USER1_ADDRESS.toHexString(),
      DEPOSIT_ADDRESS.toHexString(),
      value,
      data
    )
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.toString()
  );
});
