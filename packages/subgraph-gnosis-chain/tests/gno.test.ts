import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";
import { createTransferEvent, handleTransfer } from "../src/gno";

export function runTests(): void {
  test("Can call mappings with custom events", () => {
    // Initialise
    let user = new User("someone");
    user.save();

    // Call mappings
    let value = BigInt.fromI32(1337);
    let toAddress = Address.fromString(
      "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"
    );
    let fromAddress = Address.fromString(
      "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"
    );
    let data = "0x01";
    let newTransferEvent = createTransferEvent(
      12345,
      fromAddress,
      toAddress,
      value,
      data
    );

    handleTransfer(newTransferEvent);

    assert.fieldEquals("User", "someone", "id", "test");

    clearStore();
  });
}
