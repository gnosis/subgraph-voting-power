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

const simulateMint = (
  to: string,
  gnoValue: BigInt,
  mockEvent: ethereum.Event = newMockEvent()
): void => {
  // mint GNO to user in separate tx A
  handleGnoTransfer(
    createGnoTransferEvent(ADDRESS_ZERO.toHexString(), to, gnoValue)
  );

  // send GNO to SBCWrapper in tx B
  handleGnoTransfer(
    createGnoTransferEvent(
      to,
      WRAPPER_ADDRESS.toHexString(),
      gnoValue,
      mockEvent
    )
  );

  // mint mGNO to user in same tx B
  handleTransfer(
    createTransferEvent(
      ADDRESS_ZERO.toHexString(),
      to,
      gnoValue.times(MGNO_PER_GNO),
      mockEvent
    )
  );
};

const TWO_GNO = ONE_GNO.times(BigInt.fromI32(2));

test("Mint increases mGNO balance of recipient", () => {
  clearStore();
  // mint value to user 1
  simulateMint(USER1_ADDRESS.toHexString(), ONE_GNO);

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "mgno",
    ONE_GNO.times(MGNO_PER_GNO).toString()
  );

  // mint another 32 mGNO to user 1, should have a total of 64
  simulateMint(USER1_ADDRESS.toHexString(), ONE_GNO);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "mgno",
    TWO_GNO.times(MGNO_PER_GNO).toString()
  );
});

test("Transfer correctly decreases mGNO balance of sender", () => {
  clearStore();
  // mint 64 mGNO to USER1_ADDRESS
  simulateMint(USER1_ADDRESS.toHexString(), TWO_GNO);

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "mgno",
    TWO_GNO.times(MGNO_PER_GNO).toString()
  );

  // send 32 mGNO from USER1_ADDRESS to USER2_ADDRESS, user one should have 32 mGNO left
  const transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    USER2_ADDRESS.toHexString(),
    ONE_GNO.times(MGNO_PER_GNO)
  );
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "mgno",
    ONE_GNO.times(MGNO_PER_GNO).toString()
  );
});

test("Transfer correctly increases vote weight of recipient and decreases vote weight of sender", () => {
  clearStore();

  // mint 32 mGNO to user 1
  simulateMint(USER1_ADDRESS.toHexString(), ONE_GNO);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.toString()
  );

  // transfer half the mGNO from user 1 to user 2
  const transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    USER2_ADDRESS.toHexString(),
    ONE_GNO.times(MGNO_PER_GNO).div(BigInt.fromI32(2))
  );
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.div(BigInt.fromI32(2)).toString()
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.div(BigInt.fromI32(2)).toString()
  );
});

test("Transfer resulting in 0 vote weight removes user from store.", () => {
  clearStore();
  // mint 32 mGNO to USER1_ADDRESS
  simulateMint(USER1_ADDRESS.toHexString(), ONE_GNO);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.toString()
  );

  // send all of the 32 mGNO from USER1_ADDRESS to USER2_ADDRESS, user one should have 0 vote weight left and be removed from store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    USER2_ADDRESS.toHexString(),
    ONE_GNO.times(MGNO_PER_GNO)
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", USER1_ADDRESS.toHexString());
});

test("Transfer involving ADDRESS_ZERO does not create an ADDRESS_ZERO entity.", () => {
  clearStore();
  // mint value from ADDRESS_ZERO to USER1_ADDRESS, ADDRESS_ZERO should not be in store
  simulateMint(USER1_ADDRESS.toHexString(), ONE_GNO);
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
  // mint value from ADDRESS_ZERO to USER1_ADDRESS
  simulateMint(USER1_ADDRESS.toHexString(), ONE_GNO);

  // send value from USER1_ADDRESS to DEPOSIT_ADDRESS, DEPOSIT_ADDRESS should not be in store
  let transferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    DEPOSIT_ADDRESS.toHexString(),
    value
  );
  handleTransfer(transferEvent);
  assert.notInStore("User", DEPOSIT_ADDRESS.toHexString());
});

test("Transfer from SCBWrapper to SBCDeposit clears out the associated pending mGNO balance and credits the original sender for the deposit", () => {
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

  // swap will mint mGNO to SCB_WRAPPER_ADDRESS
  let mgnoMintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    WRAPPER_ADDRESS.toHexString(),
    value.times(MGNO_PER_GNO),
    mockEvent
  );
  handleTransfer(mgnoMintEvent);

  // send minted mGNO to deposit contract
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

test("Transfer from SCBWrapper to an address with pending mGNO balances clears out the pending mGNO balance and credits the user with mGNO", () => {
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

test("Mint to a user wallet will clear out that user's pending mGNO balance", () => {
  // Example TX: https://blockscout.com/xdai/mainnet/tx/0x01d2542b967520128e4280df233239f70ac58f4c7a6a11755b59ce2e7db960ff

  clearStore();
  const mockEvent: ethereum.Event = newMockEvent(); // all events must happen within the same transactions

  // Mint 1 GNO to USER1_ADDRESS
  const gnoMintEvent = createGnoTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    ONE_GNO,
    mockEvent
  );
  handleGnoTransfer(gnoMintEvent);

  // send 1 GNO from USER1_ADDRESS to SCB_WRAPPER_ADDRESS
  const gnoTransferEvent = createGnoTransferEvent(
    USER1_ADDRESS.toHexString(),
    WRAPPER_ADDRESS.toHexString(),
    ONE_GNO,
    mockEvent
  );
  handleGnoTransfer(gnoTransferEvent);

  // mint 32 MGNO from ADDRESS_ZERO to USER1_ADDRESS
  const mintEvent = createTransferEvent(
    ADDRESS_ZERO.toHexString(),
    USER1_ADDRESS.toHexString(),
    ONE_GNO.times(MGNO_PER_GNO),
    mockEvent
  );
  handleTransfer(mintEvent);

  assert.notInStore(
    "PendingMgnoBalance",
    mockEvent.transaction.hash.toHexString() + "-0"
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "mgno",
    ONE_GNO.times(MGNO_PER_GNO).toString()
  );
});

test("Transfer from SCBWrapper to an address with no pending mGNO balance clears out any of the pending GNO balances and credits the recipient with mGNO", () => {
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

test("Transfer from user's wallet to SBCDeposit credits that address for the deposit", () => {
  clearStore();

  // mint 32 mGNO to user 1
  simulateMint(USER1_ADDRESS.toHexString(), ONE_GNO);

  // send minted mGNO to SBC_DEPOSIT_ADDRESS
  let mgnoTransferEvent = createTransferEvent(
    USER1_ADDRESS.toHexString(),
    DEPOSIT_ADDRESS.toHexString(),
    ONE_GNO.times(MGNO_PER_GNO)
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
