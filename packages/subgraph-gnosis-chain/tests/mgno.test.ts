import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";
import { handleTransfer } from "../src/mgno";
import { Transfer } from "../generated/ds-mgno/MGNO";
import { log, newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  ONE_GNO,
  mgnoPerGno,
  DEPOSIT_ADDRESS,
} from "../src/helpers";
import { user1, user2, data } from "./helpers";

let value = ONE_GNO.times(mgnoPerGno);
let value2x = value.times(BigInt.fromI32(2));

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

test("Transfer correctly increases mGNO balance of recipient", () => {
  clearStore();
  let transferEvent = createTransferEvent(ADDRESS_ZERO, user1, value, data);

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toLowerCase(), "mgno", value.toString());

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toLowerCase(), "mgno", value2x.toString());
});

test("Transfer correctly decreases mGNO balance of sender", () => {
  clearStore();
  // mint 2674 to user1
  let mintEvent = createTransferEvent(ADDRESS_ZERO, user1, value2x, data);
  handleTransfer(mintEvent);
  assert.fieldEquals("User", user1.toLowerCase(), "mgno", value2x.toString());

  // send 1337 from user1 to user2, user one should have 1337 left
  let transferEvent = createTransferEvent(user1, user2, value, data);
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toLowerCase(), "mgno", value.toString());
});

test("Transfer correctly increases vote weight of recipient", () => {
  clearStore();
  let transferEvent = createTransferEvent(ADDRESS_ZERO, user1, value, data);

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    user1.toLowerCase(),
    "voteWeight",
    value.div(mgnoPerGno).toString()
  );

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    user1.toLowerCase(),
    "voteWeight",
    value2x.div(mgnoPerGno).toString()
  );
});

test("Transfer correctly decreases vote weight of sender", () => {
  clearStore();
  // mint 2674 to user1
  let mintEvent = createTransferEvent(ADDRESS_ZERO, user1, value2x, data);
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "User",
    user1.toLowerCase(),
    "voteWeight",
    value2x.div(mgnoPerGno).toString()
  );

  // send 1337 from user1 to user2, user one should have 1337 left
  let transferEvent = createTransferEvent(user1, user2, value, data);
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    user1.toLowerCase(),
    "voteWeight",
    value.div(mgnoPerGno).toString()
  );

  clearStore();
});

test("Transfer resulting in 0 vote weight removes user from store.", () => {
  // mint 2674 to user1
  let mintEvent = createTransferEvent(ADDRESS_ZERO, user1, value, data);
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "User",
    user1.toLowerCase(),
    "voteWeight",
    value.div(mgnoPerGno).toString()
  );

  // send 1337 from user1 to user2, user one should have 0 left and be removed from store
  let transferEvent = createTransferEvent(user1, user2, value, data);
  handleTransfer(transferEvent);
  assert.notInStore("User", user1.toLowerCase());

  clearStore();
});

test("Transfer involving ADDRESS_ZERO does not create an ADDRESS_ZERO entity.", () => {
  // mint 1337 from ADDRESS_ZERO to user1, ADDRESS_ZERO should not be in store
  let mintEvent = createTransferEvent(ADDRESS_ZERO, user1, value, data);
  handleTransfer(mintEvent);
  assert.notInStore("User", ADDRESS_ZERO);

  // send 1337 from user1 to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(user1, ADDRESS_ZERO, value, data);
  handleTransfer(transferEvent);
  assert.notInStore("User", ADDRESS_ZERO);

  clearStore();
});

test("Transfer involving DEPOSIT_ADDRESS does not create a DEPOSIT_ADDRESS entity.", () => {
  // mint 1337 from ADDRESS_ZERO to user1, ADDRESS_ZERO should not be in store
  let mintEvent = createTransferEvent(DEPOSIT_ADDRESS, user1, value, data);
  handleTransfer(mintEvent);
  assert.notInStore("User", DEPOSIT_ADDRESS);

  // send 1337 from user1 to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(user1, DEPOSIT_ADDRESS, value, data);
  handleTransfer(transferEvent);
  assert.notInStore("User", DEPOSIT_ADDRESS);

  clearStore();
});
