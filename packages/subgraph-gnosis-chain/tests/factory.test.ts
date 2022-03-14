import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { AMMPair, User } from "../generated/schema";
import { log, newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  GNO_ADDRESS,
  gno,
  USER1_ADDRESS,
  USER2_ADDRESS,
  OTHERTOKEN_ADDRESS,
  value,
  PAIR_ADDRESS,
  value2x,
  data,
} from "../src/helpers";
import { PairCreated } from "../generated/HoneySwap/Factory";
import { handleNewPair } from "../src/HoneySwap";
import { createPairCreatedEvent } from "./helpers";

// mock pair.totalSupply()
createMockedFunction(PAIR_ADDRESS, "totalSupply", "totalSupply():(uint256)")
  .withArgs([])
  .returns([ethereum.Value.fromUnsignedBigInt(value)]);

// mock gno.balanceOf(pair.address)
createMockedFunction(GNO_ADDRESS, "balanceOf", "balanceOf(address):(uint256)")
  .withArgs([ethereum.Value.fromAddress(PAIR_ADDRESS)])
  .returns([ethereum.Value.fromUnsignedBigInt(value2x)]);

test("Factory spawns pair", () => {
  clearStore();
  let otherToken = USER1_ADDRESS;
  let pairCreatedEvent = createPairCreatedEvent(
    GNO_ADDRESS,
    otherToken,
    PAIR_ADDRESS,
    value
  );
  handleNewPair(pairCreatedEvent);
  assert.fieldEquals(
    "AMMPair",
    PAIR_ADDRESS.toHexString(),
    "id",
    PAIR_ADDRESS.toHexString()
  );
});

test("New pair has correct totalSupply", () => {
  clearStore();
  let otherToken = USER1_ADDRESS;
  let pairCreatedEvent = createPairCreatedEvent(
    GNO_ADDRESS,
    otherToken,
    PAIR_ADDRESS,
    value
  );
  handleNewPair(pairCreatedEvent);
  assert.fieldEquals("AMMPair", PAIR_ADDRESS.toHexString(), "totalSupply", "0");
});

test("New pair has correct gnoReserves", () => {
  clearStore();
  let otherToken = USER1_ADDRESS;
  let pairCreatedEvent = createPairCreatedEvent(
    GNO_ADDRESS,
    otherToken,
    PAIR_ADDRESS,
    value
  );
  handleNewPair(pairCreatedEvent);
  assert.fieldEquals(
    "AMMPair",
    PAIR_ADDRESS.toHexString(),
    "gnoReserves",
    value2x.toString()
  );
});

test("New pair has correct previousRatio", () => {
  clearStore();
  let otherToken = USER1_ADDRESS;
  let pairCreatedEvent = createPairCreatedEvent(
    GNO_ADDRESS,
    otherToken,
    PAIR_ADDRESS,
    value
  );
  handleNewPair(pairCreatedEvent);
  assert.fieldEquals(
    "AMMPair",
    PAIR_ADDRESS.toHexString(),
    "previousRatio",
    "0"
  );
});

test("New pair has correct current ratio", () => {
  clearStore();
  let otherToken = USER1_ADDRESS;
  let pairCreatedEvent = createPairCreatedEvent(
    GNO_ADDRESS,
    otherToken,
    PAIR_ADDRESS,
    value
  );
  handleNewPair(pairCreatedEvent);
  assert.fieldEquals("AMMPair", PAIR_ADDRESS.toHexString(), "ratio", "0");
});
