import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";
import { newMockEvent } from "matchstick-as";
import { ADDRESS_ZERO, USER1_ADDRESS, USER2_ADDRESS, value } from "../helpers";
import { handleTransfer as handleGnoTransfer } from "../../src/gno";
import { handleTransfer as handleSgnoTransfer } from "../../src/sgno";
import { Transfer as LpTokenTransfer } from "../../generated-gc/ds-curve-sgno-gno/ERC20";
import { Transfer } from "../../generated-gc/ds-curve-sgno-gno-gauge-deposit/ERC20";
import { Transfer as GnoTransfer } from "../../generated/ds-gno/ERC20";
import { Transfer as SgnoTransfer } from "../../generated-gc/ds-sgno/ERC20";
import {
  handleTransfer as handleLpTokenTransfer,
  SGNO_GNO_POOL_ADDRESS,
} from "../../src/curve/sgnoGno";
import { handleTransfer } from "../../src/curve/sgnoGnoGaugeDeposit";
import { GNO_ADDRESS } from "../../src/constants";

const GAUGE_ADDRESS = Address.fromString(
  "0x2686d5E477d1AaA58BF8cE598fA95d97985c7Fb1"
);

let transferEvent = createTransferEvent(USER1_ADDRESS, USER2_ADDRESS, value);
let smallTransferEvent = createTransferEvent(
  USER1_ADDRESS,
  USER2_ADDRESS,
  value.div(BigInt.fromI32(2))
);

function resetFixtures(): void {
  clearStore();

  // add user with a bit of GNO and SGNO
  const user = new User(USER1_ADDRESS.toHexString());
  user.voteWeight = value.times(BigInt.fromI32(2));
  user.gno = value;
  user.mgno = BigInt.fromI32(0);
  user.lgno = BigInt.fromI32(0);
  user.sgno = value;
  user.deposit = BigInt.fromI32(0);
  user.save();
}

function simulateLpTokenMint(): void {
  // 1) GNO and SGNO transfers: user1 -> pool
  handleGnoTransfer(
    createGnoTransferEvent(USER1_ADDRESS, SGNO_GNO_POOL_ADDRESS, value)
  );
  handleSgnoTransfer(
    createSgnoTransferEvent(USER1_ADDRESS, SGNO_GNO_POOL_ADDRESS, value)
  );

  // 2) LP token transfer: zero -> user1
  handleLpTokenTransfer(
    createLpTokenTransferEvent(ADDRESS_ZERO, USER1_ADDRESS, value)
  );
}

function simulateGaugeDeposit(): void {
  handleLpTokenTransfer(
    createLpTokenTransferEvent(USER1_ADDRESS, GAUGE_ADDRESS, value)
  );

  handleTransfer(createTransferEvent(ADDRESS_ZERO, USER1_ADDRESS, value));
}

function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt,
  data: string = "0x00"
): Transfer {
  const mockEvent = newMockEvent();

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

  return new Transfer(
    GAUGE_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

function createLpTokenTransferEvent(
  from: Address,
  to: Address,
  value: BigInt,
  data: string = "0x00"
): LpTokenTransfer {
  const mockEvent = newMockEvent();

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

  return new LpTokenTransfer(
    SGNO_GNO_POOL_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

function createGnoTransferEvent(
  from: Address,
  to: Address,
  value: BigInt,
  data: string = "0x00"
): GnoTransfer {
  const mockEvent = newMockEvent();

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

  return new GnoTransfer(
    GNO_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

const SGNO_ADDRESS = Address.fromString(
  "0xa4ef9da5ba71cc0d2e5e877a910a37ec43420445"
);

function createSgnoTransferEvent(
  from: Address,
  to: Address,
  value: BigInt,
  data: string = "0x00"
): SgnoTransfer {
  const mockEvent = newMockEvent();

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

  return new SgnoTransfer(
    SGNO_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

//  TESTS
test("Staking the SGNO/GNO LP token keeps voting weight stable but updates the stakedGnoSgno", () => {
  resetFixtures();

  simulateLpTokenMint();

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.times(BigInt.fromI32(2)).toString()
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "stakedGnoSgno",
    BigInt.zero().toString()
  );

  simulateGaugeDeposit();

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.times(BigInt.fromI32(2)).toString()
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "stakedGnoSgno",
    value.times(BigInt.fromI32(2)).toString()
  );
});

test("Updates vote weight and stakedGnoSgno for sender and recipient on transfer", () => {
  resetFixtures();

  simulateLpTokenMint();
  simulateGaugeDeposit();

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "4000000"
  );

  // transfer value from USER1 to USER2
  handleTransfer(smallTransferEvent);

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "2000000"
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    "2000000"
  );
});

test("Removes sender if vote weight is 0", () => {
  resetFixtures();

  simulateLpTokenMint();
  simulateGaugeDeposit();

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "4000000"
  );

  // transfer value from USER1 to USER2
  handleTransfer(transferEvent);
  assert.notInStore(
    "WeightedPoolPosition",
    SGNO_GNO_POOL_ADDRESS.toHexString()
      .concat("-")
      .concat(USER1_ADDRESS.toHexString())
  );
  assert.notInStore("User", USER1_ADDRESS.toHexString());
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    "4000000"
  );
});
