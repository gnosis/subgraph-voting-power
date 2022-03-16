import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { User, AMMPair, AMMPosition } from "../../generated/schema";
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
} from "../helpers";
import {
  loadOrCreateAMMPosition,
  loadAMMPair,
  createAMMPair,
} from "../../src/uniswapV2/pair";
import { handleNewPair } from "../src/uniswapV2/factory";
import { createPairCreatedEvent } from "./helpers";
// import { ERC20, Transfer } from "../generated/templates/Pair/ERC20";
import { Pair, Transfer, Sync } from "../generated/templates/Pair/Pair";
import { handleSync, handleTransfer } from "../src/uniswapV2/pair";

let mintEvent = createTransferEvent(ADDRESS_ZERO, USER1_ADDRESS, value, data);
let PreBurnEvent = createTransferEvent(
  USER1_ADDRESS,
  PAIR_ADDRESS,
  value,
  data
);
let burnEvent = createTransferEvent(PAIR_ADDRESS, ADDRESS_ZERO, value, data);
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

const lowerBound: BigInt = BigInt.zero();
const BIGINT_MAX = BigInt.fromUnsignedBytes(
  Bytes.fromHexString("ff".repeat(32)) // 256 bits = 32 * ff byte
);
const upperBound: BigInt = BIGINT_MAX;

function getPositionID(pair: Address, user: Address): string {
  return pair
    .toHexString()
    .concat("-")
    .concat(user.toHexString())
    .concat("-")
    .concat(lowerBound.toHexString())
    .concat("-")
    .concat(upperBound.toHexString());
}

//  TESTS

test("Creates position on mint", () => {
  clearStore();
  // mint value to user 1
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "AMMPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "balance",
    value.toString()
  );
});

test("Creates Position on mint and transfer", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "AMMPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "id",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS)
  );
  handleTransfer(smallTransferEvent);
  assert.fieldEquals(
    "AMMPosition",
    getPositionID(PAIR_ADDRESS, USER2_ADDRESS),
    "id",
    getPositionID(PAIR_ADDRESS, USER2_ADDRESS)
  );
});

test("Adds Position to pair.positions and user.positions on mint and transfer", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "AMMPair",
    PAIR_ADDRESS.toHexString(),
    "positions",
    "[" + getPositionID(PAIR_ADDRESS, USER1_ADDRESS) + "]"
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "positions",
    "[" + getPositionID(PAIR_ADDRESS, USER1_ADDRESS) + "]"
  );
  handleTransfer(smallTransferEvent);
  assert.fieldEquals(
    "AMMPair",
    PAIR_ADDRESS.toHexString(),
    "positions",
    "[" +
      getPositionID(PAIR_ADDRESS, USER1_ADDRESS) +
      ", " +
      getPositionID(PAIR_ADDRESS, USER2_ADDRESS) +
      "]"
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "positions",
    "[" + getPositionID(PAIR_ADDRESS, USER2_ADDRESS) + "]"
  );
});

test("Removes Position from store if position balance is 0", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "AMMPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "id",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS)
  );
  handleTransfer(transferEvent);
  assert.notInStore("AMMPosition", getPositionID(PAIR_ADDRESS, USER1_ADDRESS));
});

test("Removes Position from positions if balance is 0", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "AMMPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "id",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS)
  );
  handleTransfer(PreBurnEvent);
  handleTransfer(burnEvent);
  assert.notInStore("AMMPosition", getPositionID(PAIR_ADDRESS, USER1_ADDRESS));
  assert.notInStore("User", USER1_ADDRESS.toHexString());
  assert.fieldEquals("AMMPair", PAIR_ADDRESS.toHexString(), "positions", "[]");
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "AMMPair",
    PAIR_ADDRESS.toHexString(),
    "positions",
    "[" + getPositionID(PAIR_ADDRESS, USER1_ADDRESS) + "]"
  );
});

test("Updates position balance for recipient on mint", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);
  // mint value to user 1
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "AMMPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "balance",
    value.toString()
  );
});

test("Updates vote weight for sender and recipient on transfer", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint value to user 1
  handleTransfer(mintEvent);

  // transfer value from USER1 to USER2
  handleTransfer(smallTransferEvent);

  assert.fieldEquals(
    "AMMPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "balance",
    value.div(BigInt.fromI32(2)).toString()
  );
  assert.fieldEquals(
    "AMMPosition",
    getPositionID(PAIR_ADDRESS, USER2_ADDRESS),
    "balance",
    value.div(BigInt.fromI32(2)).toString()
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

test("Removes sender if vote weight is 0", () => {
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

test("Updates totalSupply on mint", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint value to user 1
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "AMMPair",
    PAIR_ADDRESS.toHexString(),
    "totalSupply",
    value.toString()
  );
});

test("Updates totalSupply on burn", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint value to user 1
  handleTransfer(mintEvent);
  assert.fieldEquals(
    "AMMPair",
    PAIR_ADDRESS.toHexString(),
    "totalSupply",
    value.toString()
  );
  handleTransfer(burnEvent);
  assert.fieldEquals(
    "AMMPair",
    PAIR_ADDRESS.toHexString(),
    "totalSupply",
    BigInt.fromI32(0).toString()
  );
  assert.notInStore("User", PAIR_ADDRESS.toHexString());
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

  let positionUser1 = loadOrCreateAMMPosition(PAIR_ADDRESS, USER1_ADDRESS);
  let positionUser2 = loadOrCreateAMMPosition(PAIR_ADDRESS, USER2_ADDRESS);
  assert.fieldEquals(
    "AMMPair",
    pair.id,
    "positions",
    "[" + positionUser1.id + ", " + positionUser2.id + "]"
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    positionUser1.balance.times(pair.ratio).toString()
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    positionUser2.balance.times(pair.ratio).toString()
  );
});
