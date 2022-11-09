import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  DEPOSIT_ADDRESS,
  handleTransfer,
  MGNO_PER_GNO,
  WRAPPER_ADDRESS,
} from "../src/mgno";
import { handleTransfer as handleGnoTransfer } from "../src/gno";
import { Transfer } from "../generated-gc/ds-mgno/ERC20";
import { Transfer as GnoTransfer } from "../generated/ds-gno/ERC20";
import { newMockEvent } from "matchstick-as";
import { ADDRESS_ZERO, USER1_ADDRESS, USER2_ADDRESS } from "./helpers";
import { ONE_GNO } from "../src/constants";

let value = ONE_GNO.times(MGNO_PER_GNO);
let value2x = value.times(BigInt.fromI32(2));

function createTransferEvent(
  from: string,
  to: string,
  value: BigInt,
  mockEvent: ethereum.Event = newMockEvent()
): Transfer {
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
    new ethereum.EventParam("data", ethereum.Value.fromString("0x00"))
  );

  let newTransferEvent = new Transfer(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );

  return newTransferEvent;
}

function createGnoTransferEvent(
  from: string,
  to: string,
  value: BigInt,
  mockEvent: ethereum.Event = newMockEvent()
): GnoTransfer {
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
    new ethereum.EventParam("data", ethereum.Value.fromString("0x00"))
  );

  let newTransferEvent = new GnoTransfer(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );

  return newTransferEvent;
}

test("Transfer correctly increases mGNO balance of recipient", () => {
  clearStore();
  let transferEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value
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
    value2x
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
    value
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
    value
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
    value2x
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
    value
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
    value
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
    value
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
    value
  );
  handleTransfer(mintEvent);
  assert.notInStore("User", ADDRESS_ZERO.toHexString());

  // send value from USER1_ADDRESS to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    ADDRESS_ZERO.toHexString(),
    value
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
    value
  );
  handleTransfer(mintEvent);
  assert.notInStore("User", DEPOSIT_ADDRESS.toHexString());

  // send value from USER1_ADDRESS to ADDRESS_ZERO, ADDRESS_ZERO should not be in store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    DEPOSIT_ADDRESS.toHexString(),
    value
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", DEPOSIT_ADDRESS.toHexString());
});

test("Transfer from SCBWrapper to SBCDeposit clears out the associated pending MGNO balance and credits the original sender for the deposit", () => {
  clearStore();
  const mockEvent: ethereum.Event = newMockEvent(); // all events must happen within the same transactions

  let gnoMintEvent = createGnoTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value,
    mockEvent
  );
  handleGnoTransfer(gnoMintEvent);

  // send value from USER1_ADDRESS to SCB_WRAPPER_ADDRESS
  let gnoTransferEvent = createGnoTransferEvent(
    USER1_ADDRESS.toHexString(),
    WRAPPER_ADDRESS.toHexString(),
    value,
    mockEvent
  );
  handleGnoTransfer(gnoTransferEvent);

  // swap will mint MGNO to SCB_WRAPPER_ADDRESS
  let mgnoMintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    WRAPPER_ADDRESS.toHexString(),
    value.times(MGNO_PER_GNO),
    mockEvent
  );
  handleTransfer(mgnoMintEvent);

  // send minted MGNO to deposit contract
  let mgnoTransferEvent = createTransferEvent(
    WRAPPER_ADDRESS.toHexString(),
    DEPOSIT_ADDRESS.toHexString(),
    value.times(MGNO_PER_GNO),
    mockEvent
  );
  handleTransfer(mgnoTransferEvent);

  assert.notInStore(
    "PendingMgnoBalance",
    mockEvent.transaction.hash.toHexString() + "-0"
  );

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "deposit",
    value.toString()
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.toString()
  );
});

test("Transfer from SCBWrapper to an address with pending MGNO balances clears out the pending MGNO balance and credits the user with MGNO", () => {
  clearStore();
  const mockEvent: ethereum.Event = newMockEvent(); // all events must happen within the same transactions

  let gnoMintEvent = createGnoTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value,
    mockEvent
  );
  handleGnoTransfer(gnoMintEvent);

  // send value from USER1_ADDRESS to SCB_WRAPPER_ADDRESS
  let gnoTransferEvent = createGnoTransferEvent(
    USER1_ADDRESS.toHexString(),
    WRAPPER_ADDRESS.toHexString(),
    value,
    mockEvent
  );
  handleGnoTransfer(gnoTransferEvent);

  // swap will mint MGNO to SCB_WRAPPER_ADDRESS
  let mgnoMintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    WRAPPER_ADDRESS.toHexString(),
    value.times(MGNO_PER_GNO),
    mockEvent
  );
  handleTransfer(mgnoMintEvent);

  // make sure there is a pending MGNO balance for user 1
  assert.fieldEquals(
    "PendingMgnoBalance",
    mockEvent.transaction.hash.toHexString() + "-0",
    "balance",
    value.times(MGNO_PER_GNO).toString()
  );
  assert.fieldEquals(
    "PendingMgnoBalance",
    mockEvent.transaction.hash.toHexString() + "-0",
    "user",
    USER1_ADDRESS.toHexString()
  );

  // send minted MGNO back to USER1
  let mgnoTransferEvent = createTransferEvent(
    WRAPPER_ADDRESS.toHexString(),
    USER1_ADDRESS.toHexString(),
    value.times(MGNO_PER_GNO),
    mockEvent
  );
  handleTransfer(mgnoTransferEvent);

  assert.notInStore(
    "PendingMgnoBalance",
    mockEvent.transaction.hash.toHexString() + "-0"
  );

  assert.fieldEquals("User", USER1_ADDRESS.toHexString(), "gno", "0");
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "mgno",
    value.times(MGNO_PER_GNO).toString()
  );
});

test("Transfer from SCBWrapper to an address with no pending MGNO balance clears out any of the pending GNO balances and credits the recipient with MGNO", () => {
  clearStore();
  const mockEvent: ethereum.Event = newMockEvent(); // all events must happen within the same transactions

  let gnoMintEvent = createGnoTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    value,
    mockEvent
  );
  handleGnoTransfer(gnoMintEvent);

  // send value from USER1_ADDRESS to SCB_WRAPPER_ADDRESS
  let gnoTransferEvent = createGnoTransferEvent(
    USER1_ADDRESS.toHexString(),
    WRAPPER_ADDRESS.toHexString(),
    value,
    mockEvent
  );
  handleGnoTransfer(gnoTransferEvent);

  // swap will mint MGNO to SCB_WRAPPER_ADDRESS
  let mgnoMintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    WRAPPER_ADDRESS.toHexString(),
    value.times(MGNO_PER_GNO),
    mockEvent
  );
  handleTransfer(mgnoMintEvent);

  // send minted MGNO to USER2
  let mgnoTransferEvent = createTransferEvent(
    WRAPPER_ADDRESS.toHexString(),
    USER2_ADDRESS.toHexString(),
    value.times(MGNO_PER_GNO),
    mockEvent
  );
  handleTransfer(mgnoTransferEvent);

  assert.notInStore(
    "PendingMgnoBalance",
    mockEvent.transaction.hash.toHexString() + "-0"
  );

  // USER1 with no remaining vote weight is cleared out
  assert.notInStore("User", USER1_ADDRESS.toHexString());

  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "mgno",
    value.times(MGNO_PER_GNO).toString()
  );
});

test("Transfer from another address to SBCDeposit credits that address for the deposit", () => {
  clearStore();

  const mockEvent: ethereum.Event = newMockEvent(); // all events must happen within the same transactions

  // swap will mint MGNO to USER1
  let mgnoMintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    ONE_GNO.times(MGNO_PER_GNO),
    mockEvent
  );
  handleTransfer(mgnoMintEvent);

  // send minted MGNO to SBC_DEPOSIT_ADDRESS
  let mgnoTransferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    DEPOSIT_ADDRESS.toHexString(),
    ONE_GNO.times(MGNO_PER_GNO),
    mockEvent
  );
  handleTransfer(mgnoTransferEvent);

  assert.fieldEquals("User", USER1_ADDRESS.toHexString(), "mgno", "0");
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "deposit",
    ONE_GNO.toString()
  );
});
