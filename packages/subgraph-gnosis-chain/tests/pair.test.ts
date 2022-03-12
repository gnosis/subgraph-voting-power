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
} from "../src/helpers";
import { handleNewPair } from "../src/factory";
import { createPairCreatedEvent } from "./helpers";
// import { ERC20, Transfer } from "../generated/templates/Pair/ERC20";
import { Pair, Transfer } from "../generated/templates/Pair/Pair";
import { handleTransfer } from "../src/pair";

let mintEvent = createTransferEvent(ADDRESS_ZERO, USER1_ADDRESS, value, data);

// mock pair.totalSupply()
createMockedFunction(PAIR_ADDRESS, "totalSupply", "totalSupply():(uint256)")
  .withArgs([])
  .returns([ethereum.Value.fromI32(value.toI32())]);

// mock gno.balanceOf(pair.address)
createMockedFunction(GNO_ADDRESS, "balanceOf", "balanceOf(address):(uint256)")
  .withArgs([ethereum.Value.fromAddress(PAIR_ADDRESS)])
  .returns([ethereum.Value.fromI32(200)]);

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

//  START TESTS

test("Creates position on mint", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint 1337 to user 1
  handleTransfer(mintEvent);
  let position = loadOrCreateAMMPosition(PAIR_ADDRESS, USER1_ADDRESS);
  assert.fieldEquals("AMMPosition", position.id, "balance", value.toString());
});

test("Updates vote weight for sender on mint", () => {
  clearStore();
  createPair(GNO_ADDRESS, OTHERTOKEN_ADDRESS, PAIR_ADDRESS, value);

  // mint 1337 to user 1
  handleTransfer(mintEvent);
  let position = loadOrCreateAMMPosition(PAIR_ADDRESS, USER1_ADDRESS);
  logStore();
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.toString()
  );
});

// test("Updates vote weight for recipient on transfer", () => {
//   throw new Error("test not yet defined");
// });

// test("Updates vote weight for all LPs on sync", () => {
//   throw new Error("test not yet defined");
// });

// test("Removes User from LP if pair balance is 0", () => {
//   throw new Error("test not yet defined");
// });

// test("Removes position from store pair balance is 0", () => {
//   throw new Error("test not yet defined");
// });

// test("Sets ratio and previous ratio on mint", () => {
//   throw new Error("test not yet defined");
// });

// test("Updates ratio on transfer", () => {
//   throw new Error("test not yet defined");
// });
