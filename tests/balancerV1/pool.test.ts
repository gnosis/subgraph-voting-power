import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  clearStore,
  test,
  assert,
  newMockEvent,
} from "matchstick-as/assembly/index";
import {
  User,
  WeightedPool,
  WeightedPoolPosition,
} from "../../generated/schema";
import { PAIR_ADDRESS, USER1_ADDRESS } from "../helpers";
import {
  handleSwap,
  handleExitPool,
  handleJoinPool,
} from "../../src/balancerV1/pool";
import {
  LOG_JOIN,
  LOG_EXIT,
  LOG_SWAP,
} from "../../generated-gc/templates/BalancerV1Pool/Pool";
import { GNO_ADDRESS, ONE_GNO } from "../../src/constants";

const POOL_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
const OTHER_TOKEN_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000002222"
);

const HALF_A_GNO = ONE_GNO.div(BigInt.fromI32(2));

function resetFixtures(): void {
  clearStore();

  // Create pool with total supply of 1e18
  const pool = new WeightedPool(POOL_ADDRESS.toHexString());
  pool.positions = [];
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
  user.sgno = BigInt.fromI32(0);
  user.deposit = BigInt.fromI32(0);
  user.stakedGnoSgno = BigInt.fromI32(0);
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

test("Updates pool's GNO balance when LP joins", () => {
  resetFixtures();

  handleJoinPool(createJoinEvent(HALF_A_GNO));
  assert.fieldEquals(
    "WeightedPool",
    PAIR_ADDRESS.toHexString(),
    "gnoBalance",
    ONE_GNO.plus(HALF_A_GNO).toString()
  );
});

test("Updates pool's GNO balance when LP exits", () => {
  resetFixtures();

  handleExitPool(createExitEvent(HALF_A_GNO));
  assert.fieldEquals(
    "WeightedPool",
    PAIR_ADDRESS.toHexString(),
    "gnoBalance",
    HALF_A_GNO.toString()
  );
});

test("Updates vote weights of LPs on swaps changing the pool's GNO balance", () => {
  resetFixtures();

  handleSwap(createSwapEvent(HALF_A_GNO));

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    HALF_A_GNO.toString()
  );
});

function createJoinEvent(gnoIn: BigInt): LOG_JOIN {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(USER1_ADDRESS))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("tokenIn", ethereum.Value.fromAddress(GNO_ADDRESS))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAmountIn",
      ethereum.Value.fromSignedBigInt(gnoIn)
    )
  );

  return new LOG_JOIN(
    PAIR_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );
}

function createExitEvent(gnoOut: BigInt): LOG_EXIT {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(USER1_ADDRESS))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("tokenOut", ethereum.Value.fromAddress(GNO_ADDRESS))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAmountOut",
      ethereum.Value.fromSignedBigInt(gnoOut)
    )
  );

  return new LOG_EXIT(
    PAIR_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );
}

function createSwapEvent(gnoOut: BigInt): LOG_SWAP {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(USER1_ADDRESS))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "tokenIn",
      ethereum.Value.fromAddress(OTHER_TOKEN_ADDRESS)
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("tokenOut", ethereum.Value.fromAddress(GNO_ADDRESS))
  );

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAmountIn",
      ethereum.Value.fromSignedBigInt(BigInt.fromI32(1000000000))
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "tokenAmountOut",
      ethereum.Value.fromSignedBigInt(gnoOut)
    )
  );

  return new LOG_SWAP(
    PAIR_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );
}
