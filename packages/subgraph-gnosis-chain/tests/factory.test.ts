import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { AMMPair, User } from "../generated/schema";
import { log, newMockEvent } from "matchstick-as";
import {
  ADDRESS_ZERO,
  GNO_ADDRESS,
  gno,
  user1,
  user2,
  value,
  mockPair,
  value2x,
  data
} from "../src/helpers";
import { PairCreated } from "../generated/Factory/Factory";
import { handleNewPair } from "../src/factory";
import { createPairCreatedEvent } from "./helpers";

// mock pair.totalSupply()
createMockedFunction(
  Address.fromString(mockPair),
  "totalSupply",
  "totalSupply():(uint256)"
)
  .withArgs([])
  .returns([ethereum.Value.fromI32(100)]);

// mock gno.balanceOf(pair.address)
createMockedFunction(
  Address.fromString(
    "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb".toLowerCase()
  ),
  "balanceOf",
  "balanceOf(address):(uint256)"
)
  .withArgs([ethereum.Value.fromAddress(Address.fromString(mockPair))])
  .returns([ethereum.Value.fromI32(200)]);

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
  assert.fieldEquals("AMMPair", mockPair, "id", mockPair);
});
