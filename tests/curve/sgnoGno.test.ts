import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";
import { newMockEvent } from "matchstick-as";
import { ADDRESS_ZERO, USER1_ADDRESS, USER2_ADDRESS, value } from "../helpers";
import { handleTransfer as handleGnoTransfer } from "../../src/gno";
import { handleTransfer as handleSgnoTransfer } from "../../src/sgno";
import { Transfer } from "../../generated-gc/ds-curve-sgno-gno/CurveStableSwap";
import { Transfer as GnoTransfer } from "../../generated/ds-gno/ERC20";
import { Transfer as SgnoTransfer } from "../../generated-gc/ds-sgno/ERC20";
import { Transfer as DepositTokenTransfer } from "../../generated-gc/ds-curve-sgno-gno-gauge-deposit/ERC20";
import {
  handlePoolBalanceChange,
  handleTransfer,
  SGNO_GNO_POOL_ADDRESS,
} from "../../src/curve/sgnoGno";
import { handleTransfer as handleDepositTokenTransfer } from "../../src/curve/sgnoGnoGaugeDeposit";
import { GNO_ADDRESS } from "../../src/constants";

const smallValue = value.div(BigInt.fromI32(2));
let transferEvent = createTransferEvent(USER1_ADDRESS, USER2_ADDRESS, value);
let smallTransferEvent = createTransferEvent(
  USER1_ADDRESS,
  USER2_ADDRESS,
  smallValue
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
  user.stakedGnoSgno = BigInt.fromI32(0);
  user.balancerInternalGno = BigInt.fromI32(0);
  user.save();
}

function simulateMint(): void {
  // 1) GNO and SGNO transfers: user1 -> pool
  handleGnoTransfer(
    createGnoTransferEvent(USER1_ADDRESS, SGNO_GNO_POOL_ADDRESS, value)
  );
  handleSgnoTransfer(
    createSgnoTransferEvent(USER1_ADDRESS, SGNO_GNO_POOL_ADDRESS, value)
  );

  // 2) LP token transfer: zero -> user1
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
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(from))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(to))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromSignedBigInt(value))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromString(data))
  );

  return new Transfer(
    SGNO_GNO_POOL_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
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
    mockEvent.parameters,
    null
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
    mockEvent.parameters,
    null
  );
}

function getPositionID(pair: Address, user: Address): string {
  return pair
    .toHexString()
    .concat("-")
    .concat(user.toHexString());
}

const GAUGE_ADDRESS = Address.fromString(
  "0x2686d5E477d1AaA58BF8cE598fA95d97985c7Fb1"
);

function createDepositTokenTransferEvent(
  from: Address,
  to: Address,
  value: BigInt,
  data: string = "0x00"
): DepositTokenTransfer {
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

  return new DepositTokenTransfer(
    GAUGE_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );
}

//  TESTS

test("Creates WeightedPoolPosition on mint and transfer", () => {
  resetFixtures();

  simulateMint();
  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(SGNO_GNO_POOL_ADDRESS, USER1_ADDRESS),
    "id",
    getPositionID(SGNO_GNO_POOL_ADDRESS, USER1_ADDRESS)
  );
  handleTransfer(smallTransferEvent);
  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(SGNO_GNO_POOL_ADDRESS, USER2_ADDRESS),
    "id",
    getPositionID(SGNO_GNO_POOL_ADDRESS, USER2_ADDRESS)
  );
});

test("Adds position to pair.positions and user.positions on mint and transfer", () => {
  resetFixtures();

  simulateMint();
  assert.fieldEquals(
    "WeightedPool",
    SGNO_GNO_POOL_ADDRESS.toHexString(),
    "positions",
    "[" + getPositionID(SGNO_GNO_POOL_ADDRESS, USER1_ADDRESS) + "]"
  );

  assert.fieldEquals(
    "WeightedPoolPosition",
    SGNO_GNO_POOL_ADDRESS.toHexString()
      .concat("-")
      .concat(USER1_ADDRESS.toHexString()),
    "user",
    USER1_ADDRESS.toHexString()
  );

  handleTransfer(smallTransferEvent);
  assert.fieldEquals(
    "WeightedPool",
    SGNO_GNO_POOL_ADDRESS.toHexString(),
    "positions",
    "[" +
      getPositionID(SGNO_GNO_POOL_ADDRESS, USER1_ADDRESS) +
      ", " +
      getPositionID(SGNO_GNO_POOL_ADDRESS, USER2_ADDRESS) +
      "]"
  );
});

test("Removes position if liquidity is 0", () => {
  resetFixtures();

  simulateMint();
  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(SGNO_GNO_POOL_ADDRESS, USER1_ADDRESS),
    "id",
    getPositionID(SGNO_GNO_POOL_ADDRESS, USER1_ADDRESS)
  );
  handleTransfer(transferEvent);
  assert.notInStore(
    "WeightedPoolPosition",
    getPositionID(SGNO_GNO_POOL_ADDRESS, USER1_ADDRESS)
  );
});

test("Updates position liquidity for recipient on mint", () => {
  resetFixtures();

  // mint value to user 1
  simulateMint();
  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(SGNO_GNO_POOL_ADDRESS, USER1_ADDRESS),
    "liquidity",
    value.toString()
  );
});

test("Updates positions of sender and recipient on transfer", () => {
  resetFixtures();

  // mint value to user 1
  simulateMint();

  // transfer value from USER1 to USER2
  handleTransfer(smallTransferEvent);

  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(SGNO_GNO_POOL_ADDRESS, USER1_ADDRESS),
    "liquidity",
    value.div(BigInt.fromI32(2)).toString()
  );
  assert.fieldEquals(
    "WeightedPoolPosition",
    getPositionID(SGNO_GNO_POOL_ADDRESS, USER2_ADDRESS),
    "liquidity",
    value.div(BigInt.fromI32(2)).toString()
  );
});

test("Updates vote weight for recipient on mint", () => {
  resetFixtures();

  // mint value to user 1
  simulateMint();

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    value.times(BigInt.fromI32(2)).toString()
  );
});

test("Updates vote weight for sender and recipient on transfer", () => {
  resetFixtures();

  // mint value to user 1
  simulateMint();
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

  // mint value to user 1
  simulateMint();
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

test("Updates vote weight and stakedGnoSgno breakdown for all LPs on swap", () => {
  resetFixtures();

  // mint value to user 1
  simulateMint();
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "4000000"
  );

  // transfer half of the LP tokens from USER1 to USER2
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

  // deposit USER2's LP tokens in gauge
  handleTransfer(createTransferEvent(USER2_ADDRESS, GAUGE_ADDRESS, smallValue));
  handleDepositTokenTransfer(
    createDepositTokenTransferEvent(ADDRESS_ZERO, USER2_ADDRESS, smallValue)
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    "2000000"
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "stakedGnoSgno",
    "2000000"
  );

  // swap fees increase the pool balance
  handleGnoTransfer(
    createGnoTransferEvent(
      ADDRESS_ZERO,
      SGNO_GNO_POOL_ADDRESS,
      BigInt.fromI32(300000)
    )
  ); // pool GNO+SGNO balance is now 4000000+500000=4500000
  handleSgnoTransfer(
    createSgnoTransferEvent(
      ADDRESS_ZERO,
      SGNO_GNO_POOL_ADDRESS,
      BigInt.fromI32(200000)
    )
  );
  // pool GNO+SGNO balance is now 4000000+300000+200000=4500000
  handlePoolBalanceChange(newMockEvent());

  // extra vote weight is proportionally credited to all LPs
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "2250000"
  );
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    "2250000"
  );

  // it's also reflected in the stakedGnoSgno breakdown
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "stakedGnoSgno",
    "2250000"
  );
});
