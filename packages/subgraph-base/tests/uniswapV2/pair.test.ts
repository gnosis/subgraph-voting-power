import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { WeightedPool } from "../../generated/schema";
import { log, newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  USER1_ADDRESS,
  USER2_ADDRESS,
  PAIR_ADDRESS,
  value,
  value2x,
  data,
  OTHERTOKEN_ADDRESS,
} from "../helpers";
import { loadAMMPair, loadOrCreateAMMPosition } from "../../src/uniswapV2/pair";
import { handleNewPair } from "../../src/uniswapV2/factory";
import { createPairCreatedEvent } from "../helpers";
// import { ERC20, Transfer } from "../generated/templates/Pair/ERC20";
import {
  Pair,
  Transfer,
  Sync,
  Swap,
} from "../../generated/templates/Pair/Pair";
import { handleSwap, handleTransfer } from "../../src/uniswapV2/pair";
import { GNO_ADDRESS } from "../../src/helpers";

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

function simulateMint() {
  handleTransfer();
}

function createPair(
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
  data: string
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
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);
  handleTransfer(mintEvent);
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
    "liquidity",
    value.toString()
  );
});

test("Updates positions of sender and recipient on transfer", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint value to user 1
  handleTransfer(mintEvent);
  handleSync(createSyncEvent(value, value));

  // transfer value from USER1 to USER2
  handleTransfer(smallTransferEvent);

  assert.fieldEquals(
    "AMMPosition",
    getPositionID(PAIR_ADDRESS, USER1_ADDRESS),
    "liquidity",
    value.div(BigInt.fromI32(2)).toString()
  );
  assert.fieldEquals(
    "AMMPosition",
    getPositionID(PAIR_ADDRESS, USER2_ADDRESS),
    "liquidity",
    value.div(BigInt.fromI32(2)).toString()
  );
});

test("Updates vote weight for recipient on mint", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint value to user 1
  handleTransfer(mintEvent);
  handleSync(createSyncEvent(value, value));

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.toString()
  );
});

// test("Updates vote weight for sender and recipient on transfer", () => {
//   clearStore();
//   createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

//   // mint value to user 1
//   handleTransfer(mintEvent);
//   let pair = loadAMMPair(PAIR_ADDRESS);
//   assert.fieldEquals("User", USER1_ADDRESS.toHexString(), "voteWeight", "1234");

//   // transfer value from USER1 to USER2
//   handleTransfer(smallTransferEvent);
//   assert.fieldEquals(
//     "User",
//     USER1_ADDRESS.toHexString(),
//     "voteWeight",
//     "12345"
//   );
//   assert.fieldEquals(
//     "User",
//     USER2_ADDRESS.toHexString(),
//     "voteWeight",
//     "123456"
//   );
// });

// test("Removes sender if vote weight is 0", () => {
//   clearStore();
//   createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

//   // mint value to user 1
//   handleTransfer(mintEvent);
//   let pair = loadAMMPair(PAIR_ADDRESS);
//   assert.fieldEquals(
//     "User",
//     USER1_ADDRESS.toHexString(),
//     "voteWeight",
//     "1234567"
//   );

//   // transfer value from USER1 to USER2
//   handleTransfer(transferEvent);
//   assert.notInStore(
//     "AMMPosition",
//     PAIR_ADDRESS.toHexString()
//       .concat("-")
//       .concat(USER1_ADDRESS.toHexString())
//   );
//   assert.notInStore("User", USER1_ADDRESS.toHexString());
//   assert.fieldEquals(
//     "User",
//     USER2_ADDRESS.toHexString(),
//     "voteWeight",
//     "1234567"
//   );
// });

// test("Updates vote weight for all LPs on sync", () => {
//   clearStore();
//   createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

//   // mint value to user 1
//   handleTransfer(mintEvent);
//   let pair = loadAMMPair(PAIR_ADDRESS);

//   // transfer half of value from USER1 to USER2
//   handleTransfer(smallTransferEvent);

//   // mock gno.balanceOf(pair.address)
//   createMockedFunction(GNO_ADDRESS, "balanceOf", "balanceOf(address):(uint256)")
//     .withArgs([ethereum.Value.fromAddress(PAIR_ADDRESS)])
//     .returns([ethereum.Value.fromUnsignedBigInt(value)]);

//   // emit sync event
//   // note: second param is not used
//   let syncEvent = createSyncEvent(value, value);
//   handleSync(syncEvent);

//   let positionUser1 = loadOrCreateAMMPosition(PAIR_ADDRESS, USER1_ADDRESS);
//   let positionUser2 = loadOrCreateAMMPosition(PAIR_ADDRESS, USER2_ADDRESS);
//   assert.fieldEquals(
//     "AMMPair",
//     pair.id,
//     "positions",
//     "[" + positionUser1.id + ", " + positionUser2.id + "]"
//   );
//   assert.fieldEquals("User", USER1_ADDRESS.toHexString(), "voteWeight", "111");
//   assert.fieldEquals("User", USER2_ADDRESS.toHexString(), "voteWeight", "222");
// });
