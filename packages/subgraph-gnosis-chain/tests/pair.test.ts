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
import { Transfer } from "../generated/ds-gno/GNO";
import { log, newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  GNO_ADDRESS,
  user1,
  user2,
  mockPair,
  value,
  value2x,
  data,
} from "../src/helpers";
import { handleNewPair } from "../src/factory";
import { createPairCreatedEvent } from "./helpers";

// mock pair.totalSupply()
createMockedFunction(mockPair, "totalSupply", "totalSupply():(uint256)")
  .withArgs([])
  .returns([ethereum.Value.fromI32(100)]);

// mock gno.balanceOf(pair.address)
createMockedFunction(GNO_ADDRESS, "balanceOf", "balanceOf(address):(uint256)")
  .withArgs([ethereum.Value.fromAddress(mockPair)])
  .returns([ethereum.Value.fromI32(200)]);

// function createPair(
//   token0: Address,
//   token1: Address,
//   pair: Address,
//   value: BigInt
// ) {
//   let pairCreatedEvent = createPairCreatedEvent(token0, token1, pair, value);
// }

test("Factory spawns pair", () => {
  clearStore();
  let otherToken = user1;
  let pairCreatedEvent = createPairCreatedEvent(
    GNO_ADDRESS,
    otherToken,
    mockPair,
    value
  );
  handleNewPair(pairCreatedEvent);
  assert.fieldEquals("AMMPair", mockPair.toString(), "id", mockPair.toString());
});

test("Updates vote weight for sender on transfer", () => {
  clearStore();

  throw new Error("test not yet defined");
});

test("Updates vote weight for recipient on transfer", () => {
  throw new Error("test not yet defined");
});

test("Updates vote weight for all LPs on sync", () => {
  throw new Error("test not yet defined");
});

test("Removes User from LP if pair balance is 0", () => {
  throw new Error("test not yet defined");
});

test("Removes position from store pair balance is 0", () => {
  throw new Error("test not yet defined");
});

test("Sets ratio and previous ratio on mint", () => {
  throw new Error("test not yet defined");
});

test("Updates ratio on transfer", () => {
  throw new Error("test not yet defined");
});
