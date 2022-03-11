import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";
import { handleTransfer } from "../src/lgno";
import { Transfer } from "../generated/ds-lgno/LGNO";
import { log, newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  USER1_ADDRESS,
  USER2_ADDRESS,
  value,
  value2x,
  data,
} from "../src/helpers";

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt,
  data: string
): Transfer {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromSignedBigInt(value))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromString(data))
  );

  let newTransferEvent = new Transfer(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  return newTransferEvent;
}

test("Transfer correctly increases lGNO balance of recipient", () => {
  clearStore();
  // note: from and to are reversed due to an error in the implementation
  let transferEvent = createTransferEvent(
    USER1_ADDRESS,
    ADDRESS_ZERO,
    value,
    data
  );

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "lgno",
    value.toString()
  );

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "lgno",
    value2x.toString()
  );
});

test("Transfer correctly increases vote weight of recipient", () => {
  clearStore();
  let transferEvent = createTransferEvent(
    USER1_ADDRESS,
    ADDRESS_ZERO,
    value,
    data
  );

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.toString()
  );

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value2x.toString()
  );
});

test("Transfer involving ADDRESS_ZERO does not create an ADDRESS_ZERO entity.", () => {
  // send 1337 from USER1_ADDRESS to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let mintEvent = createTransferEvent(ADDRESS_ZERO, USER1_ADDRESS, value, data);
  handleTransfer(mintEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());

  // send 1337 from ADDRESS_ZERO to USER1_ADDRESS, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS,
    ADDRESS_ZERO,
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());

  clearStore();
});
