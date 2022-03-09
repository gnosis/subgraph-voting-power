import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";
import { handleTransfer } from "../src/gno";
import { GNO } from "../generated/ds-gno/GNO";
import { createTransferEvent } from "./utils";

test("Should pass", () => {
  assert.booleanEquals(true, true);
});

test("Can trigger custom events", () => {
  // Initialise
  //let user = new User("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7");
  //user.save();

  const to = "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7";
  const from = "0x0000000000000000000000000000000000000000";
  const value = "1337";
  const data = "0x00";

  // Call mappings
  let transferEvent = createTransferEvent(from, to, value, data);

  handleTransfer(transferEvent);
  logStore();
  assert.fieldEquals("User", to.toLowerCase(), "voteWeight", value);
  clearStore();
});
