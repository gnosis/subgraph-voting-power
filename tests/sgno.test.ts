import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { handleTransfer } from "../src/sgno";
import { Transfer } from "../generated/ds-sgno/ERC20";
import { newMockEvent } from "matchstick-as";
import { ADDRESS_ZERO, ONE_GNO, USER1_ADDRESS, USER2_ADDRESS } from "./helpers";

let value = ONE_GNO;
let value2x = value.times(BigInt.fromI32(2));

function createTransferEvent(
  from: string,
  to: string,
  value: BigInt,
  data: string = "0x00"
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

test("Transfer correctly increases sGNO balance of recipient", () => {
  let transferEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value
  );

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "sgno",
    value.toString()
  );

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "sgno",
    value2x.toString()
  );
  clearStore();
});

test("Transfer correctly decreases sGNO balance of sender", () => {
  // mint 2674 to USER1_ADDRESS
  let mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value2x
  );
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "sgno",
    value2x.toString()
  );

  // send 1337 from USER1_ADDRESS to USER2_ADDRESS, user one should have 1337 left
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    USER2_ADDRESS.toHexString(),
    value
  );
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "sgno",
    value.toString()
  );

  clearStore();
});

test("Transfer correctly increases vote weight of recipient", () => {
  let transferEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value
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
    value2x
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
    value
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
    value
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
    value
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
    value
  );
  handleTransfer(mintEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());

  // send 1337 from USER1_ADDRESS to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    ADDRESS_ZERO.toHexString(),
    value
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());

  clearStore();
});
