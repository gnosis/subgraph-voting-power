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
import { ADDRESS_ZERO } from "../src/helpers";

const user1 = "0x0000000000000000000000000000000000000001";
const user2 = "0x0000000000000000000000000000000000000002";
const value = BigInt.fromI32(1337);
const value2x = BigInt.fromI32(2674);
const data = "0x00";

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

test("Transfer correctly increases lGNO balance of recipient", () => {
  clearStore();
  // note: from and to are reversed due to an error in the implementation
  let transferEvent = createTransferEvent(user1, ADDRESS_ZERO, value, data);

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toLowerCase(), "lgno", value.toString());

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toLowerCase(), "lgno", value2x.toString());
});

test("Transfer correctly increases vote weight of recipient", () => {
  clearStore();
  let transferEvent = createTransferEvent(user1, ADDRESS_ZERO, value, data);

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    user1.toLowerCase(),
    "voteWeight",
    value.toString()
  );

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    user1.toLowerCase(),
    "voteWeight",
    value2x.toString()
  );
});

test("Transfer involving ADDRESS_ZERO does not create an ADDRESS_ZERO entity.", () => {
  // send 1337 from user1 to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let mintEvent = createTransferEvent(ADDRESS_ZERO, user1, value, data);
  handleTransfer(mintEvent);
  assert.notInStore("User", ADDRESS_ZERO);

  // send 1337 from ADDRESS_ZERO to user1, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(user1, ADDRESS_ZERO, value, data);
  handleTransfer(transferEvent);
  assert.notInStore("User", ADDRESS_ZERO);

  clearStore();
});
