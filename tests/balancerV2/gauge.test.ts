import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  User,
  WeightedPool,
  WeightedPoolPosition,
} from "../../generated/schema";
import { newMockEvent } from "matchstick-as";
import { ADDRESS_ZERO, USER1_ADDRESS, USER2_ADDRESS } from "../helpers";
import { handleTransfer as handleLpTokenTransfer } from "../../src/balancerV2/pool";
import {
  COW_GNO_GAUGE_ADDRESS,
  COW_GNO_POOL_ADDRESS,
  handleTransfer as handleStakedTokenTransfer,
} from "../../src/balancerV2/gauge";
import { Transfer } from "../../generated/templates/BalancerV2Pool/ERC20";
import { ONE_GNO } from "../../src/constants";

function resetFixtures(): void {
  clearStore();

  // Create 50COW-50GNO pool with total supply of 1e18
  const pool = new WeightedPool(COW_GNO_POOL_ADDRESS.toHexString());
  pool.gnoIsFirst = true;
  pool.totalSupply = ONE_GNO;
  pool.gnoBalance = ONE_GNO;
  pool.save();

  // create user
  const user = new User(USER1_ADDRESS.toHexString());
  user.voteWeight = ONE_GNO;
  user.gno = BigInt.fromI32(0);
  user.mgno = BigInt.fromI32(0);
  user.lgno = BigInt.fromI32(0);
  user.deposit = BigInt.fromI32(0);
  user.balancerInternalGno = BigInt.fromI32(0);
  user.save();

  // create a position of that user in the pool with 1e18 liquidity
  const position = new WeightedPoolPosition(
    pool.id.concat("-").concat(user.id)
  );
  position.pool = pool.id;
  position.user = user.id;
  position.liquidity = ONE_GNO;
  position.save();
  pool.positions = pool.positions.concat([position.id]);
  pool.save();
}

function simulateStake(userAddress: Address, amount: BigInt): void {
  handleLpTokenTransfer(
    createLpTokenTransferEvent(userAddress, COW_GNO_GAUGE_ADDRESS, amount)
  );
  handleStakedTokenTransfer(
    createStakedTokenTransferEvent(ADDRESS_ZERO, userAddress, amount)
  );
}

function simulateUnstake(userAddress: Address, amount: BigInt): void {
  handleStakedTokenTransfer(
    createStakedTokenTransferEvent(userAddress, COW_GNO_GAUGE_ADDRESS, amount)
  );
  handleLpTokenTransfer(
    createLpTokenTransferEvent(COW_GNO_GAUGE_ADDRESS, userAddress, amount)
  );
}

function createLpTokenTransferEvent(
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
    COW_GNO_POOL_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

function createStakedTokenTransferEvent(
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
    COW_GNO_GAUGE_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

//  TESTS
test("Keeps vote weight when staking & unstaking LP tokens", () => {
  resetFixtures();

  simulateStake(USER1_ADDRESS, ONE_GNO);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.toString()
  );

  simulateUnstake(USER1_ADDRESS, ONE_GNO);
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.toString()
  );
});

test("Updates users' vote weights when transferring staked LP tokens", () => {
  resetFixtures();
  simulateStake(USER1_ADDRESS, ONE_GNO);

  handleStakedTokenTransfer(
    createStakedTokenTransferEvent(USER1_ADDRESS, USER2_ADDRESS, ONE_GNO)
  );
  assert.notInStore("User", USER1_ADDRESS.toHexString());
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.toString()
  );
});
