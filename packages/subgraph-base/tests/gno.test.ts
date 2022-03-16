import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";
import { handleTransfer } from "../src/gno";
import { Transfer } from "../generated/ds-gno/ERC20";
import { log, newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  USER1_ADDRESS,
  USER2_ADDRESS,
  value,
  value2x,
  data,
} from "./helpers";

function createTransferEvent(
  from: string,
  to: string,
  value: BigInt,
  data: string
): Transfer {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    )
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

test("Transfer correctly increases GNO balance of recipient", () => {
  let transferEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value,
    data
  );

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "gno",
    value.toString()
  );

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "gno",
    value2x.toString()
  );
  clearStore();
});

test("Transfer correctly decreases GNO balance of sender", () => {
  // mint 2674 to USER1_ADDRESS
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value2x,
    data
  );
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "gno",
    value2x.toString()
  );

  // send 1337 from USER1_ADDRESS to USER2_ADDRESS, user one should have 1337 left
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    USER2_ADDRESS.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "gno",
    value.toString()
  );

  clearStore();
});

test("Transfer correctly increases vote weight of recipient", () => {
  let transferEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
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
  clearStore();
});

test("Transfer correctly decreases vote weight of sender", () => {
  // mint 2674 to USER1_ADDRESS
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value2x,
    data
  );
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value2x.toString()
  );

  // send 1337 from USER1_ADDRESS to USER2_ADDRESS, user one should have 1337 left
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    USER2_ADDRESS.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.toString()
  );

  clearStore();
});

test("Transfer resulting in 0 vote weight removes user from store.", () => {
  // mint 2674 to USER1_ADDRESS
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value,
    data
  );
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.toString()
  );

  // send 1337 from USER1_ADDRESS to USER2_ADDRESS, user one should have 0 left and be removed from store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    USER2_ADDRESS.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", USER1_ADDRESS.toHexString());

  clearStore();
});

test("Transfer involving ADDRESS_ZERO does not create an ADDRESS_ZERO entity.", () => {
  // mint 1337 from ADDRESS_ZERO to USER1_ADDRESS, ADDRESS_ZERO should not be in store
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value,
    data
  );
  handleTransfer(mintEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());

  // send 1337 from USER1_ADDRESS to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    ADDRESS_ZERO.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());

  clearStore();
});
