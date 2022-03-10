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
import { ADDRESS_ZERO, GNO_ADDRESS, gno } from "../src/helpers";
import { PairCreated } from "../generated/Factory/Factory";
import { handleNewPair } from "../src/factory";
import {
  user1,
  user2,
  value,
  mockPair,
  value2x,
  data,
  createPairCreatedEvent,
} from "./helpers";
import { Pair } from "../generated/templates/Pair/Pair";

createMockedFunction(
  Address.fromString(mockPair),
  "totalSupply",
  "totalSupply():(uint256)"
)
  .withArgs([])
  .returns([ethereum.Value.fromI32(100)]);

Pair.bind(Address.fromString(mockPair));

createMockedFunction(GNO_ADDRESS, "balanceOf", "balanceOf(address):(uint256)")
  .withArgs([ethereum.Value.fromString(mockPair)])
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
  logStore();
  assert.fieldEquals("AMMPair", mockPair, "id", mockPair);
});
