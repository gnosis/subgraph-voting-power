import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { User, WeightedPool } from "../../generated/schema";
import { newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  USER1_ADDRESS,
  USER2_ADDRESS,
  PAIR_ADDRESS,
  value,
  OTHERTOKEN_ADDRESS,
} from "../helpers";
import { handleNewPair } from "../../src/uniswapV2/factory";
import { handleTransfer as handleGnoTransfer } from "../../src/gno";
import { createPairCreatedEvent } from "../helpers";
import { Transfer, Swap } from "../../generated/templates/Pair/Pair";
import { Transfer as GnoTransfer } from "../../generated/ds-gno/ERC20";
import { handleSwap, handleTransfer } from "../../src/uniswapV2/pair";
import { GNO_ADDRESS, ZERO_BD, ZERO_BI } from "../../src/helpers";

let transferEvent = createTransferEvent(USER1_ADDRESS, USER2_ADDRESS, value);
let smallTransferEvent = createTransferEvent(
  USER1_ADDRESS,
  USER2_ADDRESS,
  value.div(BigInt.fromI32(2))
);

function resetFixtures(): void {
  clearStore();

  // add user with a bit of GNO
  const user = new User(USER1_ADDRESS.toHexString());
  user.voteWeight = value;
  user.gno = value;
  user.mgno = BigInt.fromI32(0);
  user.lgno = BigInt.fromI32(0);
  user.sgno = BigInt.fromI32(0);
  user.deposit = BigInt.fromI32(0);
  user.save();

  const pairCreatedEvent = createPairCreatedEvent(
    GNO_ADDRESS,
    OTHERTOKEN_ADDRESS,
    PAIR_ADDRESS,
    value
  );
  handleNewPair(pairCreatedEvent);
}

function simulateMint(): void {
  // 1) GNO transfer: user1 -> pair
  handleGnoTransfer(createGnoTransferEvent(USER1_ADDRESS, PAIR_ADDRESS, value));

  // 2) LP token transfer: zero -> user1
  handleTransfer(createTransferEvent(ADDRESS_ZERO, USER1_ADDRESS, value));
}

function simulateBurn(): void {
  // 1) LP token transfers: user1 -> pair -> zero
  handleTransfer(createTransferEvent(USER1_ADDRESS, PAIR_ADDRESS, value));
  handleTransfer(createTransferEvent(PAIR_ADDRESS, ADDRESS_ZERO, value));

  // 2) GNO transfer: pair -> user1
  handleGnoTransfer(createGnoTransferEvent(PAIR_ADDRESS, USER1_ADDRESS, value));
}

function simulateSwap(): void {
  const USER9_ADDRESS = Address.fromString(
    "0x0000000000000000000000000000000000000009"
  );
  // 1) transfer GNO to pool
  handleGnoTransfer(
    createGnoTransferEvent(USER9_ADDRESS, PAIR_ADDRESS, BigInt.fromI32(105000))
  );

  handleSwap(
    createSwapEvent(
      BigInt.fromI32(105000),
      ZERO_BI,
      ZERO_BI,
      BigInt.fromI32(100000),
      USER9_ADDRESS
    )
  );
}

function createPool(
  token0: Address,
  token1: Address,
  pair: Address,
  value: BigInt = BigInt.fromU32(0)
): WeightedPool {
  let pairCreatedEvent = createPairCreatedEvent(token0, token1, pair, value);
  handleNewPair(pairCreatedEvent);
  assert.fieldEquals(
    "WeightedPool",
    pair.toHexString(),
    "id",
    pair.toHexString()
  );
  return new WeightedPool(pair.toHexString());
}

function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt,
  data: string = "0x00"
): Transfer {
  const mockEvent = newMockEvent();

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

  return new Transfer(
    PAIR_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

function createGnoTransferEvent(
  from: Address,
  to: Address,
  value: BigInt,
  data: string = "0x00"
): GnoTransfer {
  const mockEvent = newMockEvent();

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

  return new GnoTransfer(
    GNO_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

function createSwapEvent(
  amount0In: BigInt,
  amount1In: BigInt,
  amount0Out: BigInt,
  amount1Out: BigInt,
  to: Address
): Swap {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(to))
  );

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "amount0In",
      ethereum.Value.fromSignedBigInt(amount0In)
    )
  );

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "amount1In",
      ethereum.Value.fromSignedBigInt(amount1In)
    )
  );

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "amount0Out",
      ethereum.Value.fromSignedBigInt(amount0Out)
    )
  );

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "amount1Out",
      ethereum.Value.fromSignedBigInt(amount1Out)
    )
  );

  mockEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );

  return new Swap(
    PAIR_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

function getPositionID(pair: Address, user: Address): string {
  return pair
    .toHexString()
    .concat("-")
    .concat(user.toHexString());
}

//  TESTS

test("Creates WeightedPoolPosition on mint and transfer", () => {
  resetFixtures();

  simulateMint();
  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "id",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS)
  );
  handleTransfer(smallTransferEvent);
  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(PAIR_ADDRESS, USER2_ADDRESS),
    "id",
    getPositionID(PAIR_ADDRESS, USER2_ADDRESS)
  );
});

test("Adds position to pair.positions and user.positions on mint and transfer", () => {
  resetFixtures();

  simulateMint();
  assert.fieldEquals(
    "WeightedPool",
    PAIR_ADDRESS.toHexString(),
    "positions",
    "[" + getPositionID(PAIR_ADDRESS, USER1_ADDRESS) + "]"
  );

  assert.fieldEquals(
    "WeightedPoolPosition",
    PAIR_ADDRESS.toHexString()
      .concat("-")
      .concat(USER1_ADDRESS.toHexString()),
    "user",
    USER1_ADDRESS.toHexString()
  );

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "weightedPoolPositions",
    "[" + getPositionID(PAIR_ADDRESS, USER1_ADDRESS) + "]"
  );
  handleTransfer(smallTransferEvent);
  assert.fieldEquals(
    "WeightedPool",
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
    "weightedPoolPositions",
    "[" + getPositionID(PAIR_ADDRESS, USER2_ADDRESS) + "]"
  );
});

test("Removes position if liquidity is 0", () => {
  resetFixtures();

  simulateMint();
  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "id",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS)
  );
  handleTransfer(transferEvent);
  assert.notInStore(
    "WeightedPoolPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS)
  );
});

test("Updates position liquidity for recipient on mint", () => {
  resetFixtures();

  // mint value to user 1
  simulateMint();
  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "liquidity",
    value.toString()
  );
});

test("Updates positions of sender and recipient on transfer", () => {
  resetFixtures();

  // mint value to user 1
  simulateMint();

  // transfer value from USER1 to USER2
  handleTransfer(smallTransferEvent);

  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "liquidity",
    value.div(BigInt.fromI32(2)).toString()
  );
  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(PAIR_ADDRESS, USER2_ADDRESS),
    "liquidity",
    value.div(BigInt.fromI32(2)).toString()
  );
});

test("Updates vote weight for recipient on mint", () => {
  resetFixtures();

  // mint value to user 1
  simulateMint();

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.toString()
  );
});

test("Updates vote weight for sender and recipient on transfer", () => {
  resetFixtures();

  // mint value to user 1
  simulateMint();
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "2000000"
  );

  // transfer value from USER1 to USER2
  handleTransfer(smallTransferEvent);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "1000000"
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    "1000000"
  );
});

test("Removes sender if vote weight is 0", () => {
  resetFixtures();

  // mint value to user 1
  simulateMint();
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "2000000"
  );

  // transfer value from USER1 to USER2
  handleTransfer(transferEvent);
  assert.notInStore(
    "WeightedPoolPosition",
    PAIR_ADDRESS.toHexString()
      .concat("-")
      .concat(USER1_ADDRESS.toHexString())
  );
  assert.notInStore("User", USER1_ADDRESS.toHexString());
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    "2000000"
  );
});

test("Updates vote weight for all LPs on swap", () => {
  resetFixtures();
  // mint value to user 1
  simulateMint();
  // transfer half of value from USER1 to USER2
  handleTransfer(smallTransferEvent);
  // vote weights before swap:
  // user1: 1000000
  // user2: 1000000
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "1000000"
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    "1000000"
  );

  simulateSwap();

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "1052500"
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    "1052500"
  );
});
