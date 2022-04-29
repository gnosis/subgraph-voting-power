import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleTransfer } from "../src/mgno";
import { Transfer } from "../generated/ds-mgno/ERC20";
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

test("Transfer correctly increases mGNO balance of recipient", () => {
  clearStore();
  let transferEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value,
    data
  );

  // mint value to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "mgno",
    value.toString()
  );

  // mint another value to user 1, should have a total of value2x
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "mgno",
    value2x.toString()
  );
});

test("Transfer correctly decreases mGNO balance of sender", () => {
  clearStore();
  // mint value2x to USER1_ADDRESS
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
    "mgno",
    value2x.toString()
  );

  // send value from USER1_ADDRESS to USER2_ADDRESS, user one should have value left
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
    "mgno",
    value.toString()
  );
});

test("Transfer correctly increases vote weight of recipient", () => {
  clearStore();
  let transferEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value,
    data
  );

  // mint value to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.div(MGNO_PER_GNO).toString()
  );

  // mint another value to user 1, should have a total of value2x
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value2x.div(MGNO_PER_GNO).toString()
  );
});

test("Transfer correctly decreases vote weight of sender", () => {
  clearStore();
  // mint value2x to USER1_ADDRESS
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
    value2x.div(MGNO_PER_GNO).toString()
  );

  // send value from USER1_ADDRESS to USER2_ADDRESS, user one should have value left
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
    value.div(MGNO_PER_GNO).toString()
  );
});

test("Transfer resulting in 0 vote weight removes user from store.", () => {
  clearStore();
  // mint value2x to USER1_ADDRESS
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
    value.div(MGNO_PER_GNO).toString()
  );

  // send value from USER1_ADDRESS to USER2_ADDRESS, user one should have 0 left and be removed from store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    USER2_ADDRESS.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", USER1_ADDRESS.toHexString());
});

test("Transfer involving ADDRESS_ZERO does not create an ADDRESS_ZERO entity.", () => {
  clearStore();
  // mint value from ADDRESS_ZERO to USER1_ADDRESS, ADDRESS_ZERO should not be in store
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value,
    data
  );
  handleTransfer(mintEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());

  // send value from USER1_ADDRESS to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    ADDRESS_ZERO.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());
});

test("Transfer involving DEPOSIT_ADDRESS does not create a DEPOSIT_ADDRESS entity.", () => {
  clearStore();
  // mint value from ADDRESS_ZERO to USER1_ADDRESS, ADDRESS_ZERO should not be in store
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value,
    data
  );
  handleTransfer(mintEvent);
  assert.notInStore("User", DEPOSIT_ADDRESS.toHexString());

  // send value from USER1_ADDRESS to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    DEPOSIT_ADDRESS.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", DEPOSIT_ADDRESS.toHexString());
});
