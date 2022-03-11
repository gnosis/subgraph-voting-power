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
import { Transfer } from "../generated/ds-gno/GNO";
import { log, newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  user1,
  user2,
  value,
  value2x,
  data,
} from "../src/helpers";

export function createTransferEvent(
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
    user1.toHexString(),
    value,
    data
  );

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toHexString(), "gno", value.toString());

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toHexString(), "gno", value2x.toString());
  clearStore();
});

test("Transfer correctly decreases GNO balance of sender", () => {
  // mint 2674 to user1
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    user1.toHexString(),
    value2x,
    data
  );
  handleTransfer(mintEvent);
  assert.fieldEquals("User", user1.toHexString(), "gno", value2x.toString());

  // send 1337 from user1 to user2, user one should have 1337 left
  let transferEvent = createTransferEvent(
    user1.toHexString(),
    user2.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toHexString(), "gno", value.toString());

  clearStore();
});

test("Transfer correctly increases vote weight of recipient", () => {
  let transferEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    user1.toHexString(),
    value,
    data
  );

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    user1.toHexString(),
    "voteWeight",
    value.toString()
  );

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    user1.toHexString(),
    "voteWeight",
    value2x.toString()
  );
  clearStore();
});

test("Transfer correctly decreases vote weight of sender", () => {
  // mint 2674 to user1
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    user1.toHexString(),
    value2x,
    data
  );
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "User",
    user1.toHexString(),
    "voteWeight",
    value2x.toString()
  );

  // send 1337 from user1 to user2, user one should have 1337 left
  let transferEvent = createTransferEvent(
    user1.toHexString(),
    user2.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    user1.toHexString(),
    "voteWeight",
    value.toString()
  );

  clearStore();
});

test("Transfer resulting in 0 vote weight removes user from store.", () => {
  // mint 2674 to user1
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    user1.toHexString(),
    value,
    data
  );
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "User",
    user1.toHexString(),
    "voteWeight",
    value.toString()
  );

  // send 1337 from user1 to user2, user one should have 0 left and be removed from store
  let transferEvent = createTransferEvent(
    user1.toHexString(),
    user2.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", user1.toHexString());

  clearStore();
});

test("Transfer involving ADDRESS_ZERO does not create an ADDRESS_ZERO entity.", () => {
  // mint 1337 from ADDRESS_ZERO to user1, ADDRESS_ZERO should not be in store
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    user1.toHexString(),
    value,
    data
  );
  handleTransfer(mintEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());

  // send 1337 from user1 to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(
    user1.toHexString(),
    ADDRESS_ZERO.toHexString(),
    value,
    data
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());

  clearStore();
});
