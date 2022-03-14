import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { User, AMMPair, AMMPosition } from "../generated/schema";
import { log, newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  GNO_ADDRESS,
  USER1_ADDRESS,
  USER2_ADDRESS,
  PAIR_ADDRESS,
  value,
  value2x,
  data,
  OTHERTOKEN_ADDRESS,
  loadOrCreateAMMPosition,
  loadOrCreateUser,
  loadOrCreateAMMPair,
} from "../src/helpers";
import { handleNewPair } from "../src/factory";
import { createPairCreatedEvent } from "./helpers";
// import { ERC20, Transfer } from "../generated/templates/Pair/ERC20";
import { Pair, Transfer, Sync } from "../generated/templates/Pair/Pair";
import { handleSync, handleTransfer } from "../src/pair";

let mintEvent = createTransferEvent(ADDRESS_ZERO, USER1_ADDRESS, value, data);
let transferEvent = createTransferEvent(
  USER1_ADDRESS,
  USER2_ADDRESS,
  value,
  data
);
let smallTransferEvent = createTransferEvent(
  USER1_ADDRESS,
  USER2_ADDRESS,
  value.div(BigInt.fromI32(2)),
  data
);

// mock pair.totalSupply()
createMockedFunction(PAIR_ADDRESS, "totalSupply", "totalSupply():(uint256)")
  .withArgs([])
  .returns([ethereum.Value.fromI32(value.toI32())]);

// mock gno.balanceOf(pair.address)
createMockedFunction(GNO_ADDRESS, "balanceOf", "balanceOf(address):(uint256)")
  .withArgs([ethereum.Value.fromAddress(PAIR_ADDRESS)])
  .returns([ethereum.Value.fromUnsignedBigInt(value2x)]);

function createPair(
  token0: Address,
  token1: Address,
  pair: Address,
  value: BigInt
): AMMPair {
  let pairCreatedEvent = createPairCreatedEvent(token0, token1, pair, value);
  handleNewPair(pairCreatedEvent);
  assert.fieldEquals("AMMPair", pair.toHexString(), "id", pair.toHexString());
  const newPair: AMMPair = new AMMPair(pair.toHexString());
  return newPair;
}

function createTransferEvent(
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
    PAIR_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  return newTransferEvent;
}

function createSyncEvent(reserve0: BigInt, reserve1: BigInt): Sync {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("reserve0", ethereum.Value.fromSignedBigInt(value))
  );

  mockEvent.parameters.push(
    new ethereum.EventParam("reserve0", ethereum.Value.fromSignedBigInt(value))
  );

  let newSyncEvent = new Sync(
    PAIR_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  return newSyncEvent;
}

//  TESTS

test("Creates position on mint", () => {
  clearStore();
  // mint value to user 1
  handleTransfer(mintEvent);
  let position = loadOrCreateAMMPosition(PAIR_ADDRESS, USER1_ADDRESS);
  assert.fieldEquals("AMMPosition", position.id, "balance", value.toString());
});

test("Adds User to lps on mint and transfer", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);
  handleTransfer(mintEvent);
  let pair = loadOrCreateAMMPair(PAIR_ADDRESS);
  assert.fieldEquals(
    "AMMPair",
    pair.id,
    "lps",
    "[".concat(USER1_ADDRESS.toHexString().concat("]"))
  );
});

test("Removes User from LP if pair balance is 0", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);
  handleTransfer(mintEvent);
  let pair = loadOrCreateAMMPair(PAIR_ADDRESS);
  assert.fieldEquals(
    "AMMPair",
    pair.id,
    "lps",
    "[".concat(USER1_ADDRESS.toHexString().concat("]"))
  );
  handleTransfer(transferEvent);
  assert.fieldEquals(
    "AMMPair",
    pair.id,
    "lps",
    "[".concat(USER2_ADDRESS.toHexString().concat("]"))
  );
});

test("Updates vote weight for recipient on mint", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint value to user 1
  handleTransfer(mintEvent);
  let pair = loadOrCreateAMMPair(PAIR_ADDRESS);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.times(pair.ratio).toString()
  );
});

test("Updates vote weight for sender and recipient on transfer", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint value to user 1
  handleTransfer(mintEvent);
  let pair = loadOrCreateAMMPair(PAIR_ADDRESS);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.times(pair.ratio).toString()
  );

  // transfer value from USER1 to USER2
  handleTransfer(smallTransferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value
      .times(pair.ratio)
      .div(BigInt.fromI32(2))
      .toString()
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    value
      .times(pair.ratio)
      .div(BigInt.fromI32(2))
      .toString()
  );
});

test("Removes sender if vote weight becomes 0", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint value to user 1
  handleTransfer(mintEvent);
  let pair = loadOrCreateAMMPair(PAIR_ADDRESS);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.times(pair.ratio).toString()
  );

  // transfer value from USER1 to USER2
  handleTransfer(transferEvent);
  assert.notInStore(
    "AMMPosition",
    PAIR_ADDRESS.toHexString()
      .concat("-")
      .concat(USER1_ADDRESS.toHexString())
  );
  assert.notInStore("User", USER1_ADDRESS.toHexString());
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    value.times(pair.ratio).toString()
  );
});

test("Updates vote weight for all LPs on sync", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint value to user 1
  handleTransfer(mintEvent);
  let pair = loadOrCreateAMMPair(PAIR_ADDRESS);

  // transfer half of value from USER1 to USER2
  handleTransfer(smallTransferEvent);

  // mock gno.balanceOf(pair.address)
  createMockedFunction(GNO_ADDRESS, "balanceOf", "balanceOf(address):(uint256)")
    .withArgs([ethereum.Value.fromAddress(PAIR_ADDRESS)])
    .returns([ethereum.Value.fromUnsignedBigInt(value)]);

  // emit sync event
  // note: second param is not used
  let syncEvent = createSyncEvent(value, value);
  handleSync(syncEvent);

  let user1Position = loadOrCreateAMMPosition(PAIR_ADDRESS, USER1_ADDRESS);
  let user2Position = loadOrCreateAMMPosition(PAIR_ADDRESS, USER2_ADDRESS);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    user1Position.balance.times(pair.ratio).toString()
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    user2Position.balance.times(pair.ratio).toString()
  );
});

test("Removes position from store if position balance is 0", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);
  handleTransfer(mintEvent);
  let position = loadOrCreateAMMPosition(PAIR_ADDRESS, USER1_ADDRESS);
  assert.fieldEquals("AMMPosition", position.id, "id", position.id);
  handleTransfer(transferEvent);
  assert.notInStore("AMMPosition", position.id);
});
