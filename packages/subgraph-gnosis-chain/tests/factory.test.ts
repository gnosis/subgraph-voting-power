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
import { ADDRESS_ZERO, GNO_ADDRESS } from "../src/helpers";
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
import { Pair } from "../generated/templates";

createMockedFunction(
  Address.fromString(mockPair),
  "totalSupply",
  "totalSupply():(uint256)"
)
  .withArgs([])
  .returns([ethereum.Value.fromI32(100)]);

let pair = Pair.bind(Address.fromString(mockPair));
let totalSupply = pair.totalSupply();

test("Factory spawns pair", () => {
  clearStore();
  let gno = GNO_ADDRESS;
  let otherToken = user1;
  let pairCreatedEvent = createPairCreatedEvent(gno, otherToken, pair, value);
  handleNewPair(pairCreatedEvent);
  logStore();
  assert.fieldEquals("AMMPair", pair, "id", pair);
});
