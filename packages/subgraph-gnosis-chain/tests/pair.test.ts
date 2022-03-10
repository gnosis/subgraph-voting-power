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
  user1,
  user2,
  value,
  value2x,
  data,
} from "../src/helpers";

test("Updates vote weight for sender on transfer", () => {
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
