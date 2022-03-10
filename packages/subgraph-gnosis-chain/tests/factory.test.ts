import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";
import { log, newMockEvent } from "matchstick-as";
import { ADDRESS_ZERO, GNO_ADDRESS } from "../src/helpers";
import { PairCreated } from "../generated/Factory/Factory";
import { handleNewPair } from "../src/factory";
import {
  user1,
  user2,
  value,
  value2x,
  data,
  createPairCreatedEvent,
} from "./helpers";

test("Factory spawns pair", () => {
  clearStore();
  let gno = "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb";
  let otherToken = user1;
  let pair = user2;
  let pairCreatedEvent = createPairCreatedEvent(gno, otherToken, pair, value);
  handleNewPair(pairCreatedEvent);
  logStore();
  assert.fieldEquals("AMMPair", pair, "id", pair);
});
