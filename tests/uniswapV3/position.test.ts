import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  assert,
  clearStore,
  createMockedFunction,
  newMockEvent,
  test,
} from "matchstick-as";
import {
  ConcentratedLiquidityPair,
  ConcentratedLiquidityPosition,
  User,
} from "../../generated/schema";
import { GNO_ADDRESS, ONE_BD, ONE_GNO, ZERO_BI } from "../../src/helpers";
import {
  DecreaseLiquidity,
  IncreaseLiquidity,
  Transfer,
} from "../../generated/NonfungiblePositionManager/NonfungiblePositionManager";
import {
  handleIncreaseLiquidity,
  handleDecreaseLiquidity,
  handleTransfer,
  FACTORY_ADDRESS,
} from "../../src/uniswapV3/position";

const PAIR_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
const USER1_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);
const USER2_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000002"
);
const OTHER_TOKEN_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000002222"
);
const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = Address.fromString(
  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
);

const MIN_TICK = -887272;
const MAX_TICK = -MIN_TICK;

const TOKEN_ID = BigInt.fromI32(123);

function resetFixtures(): void {
  clearStore();

  const pair = new ConcentratedLiquidityPair(PAIR_ADDRESS.toHexString());
  pair.gnoIsFirst = true;
  pair.sqrtRatio = ONE_BD;
  pair.positions = [];
  pair.save();

  const user = new User(USER1_ADDRESS.toHexString());
  user.voteWeight = ONE_GNO;
  user.gno = BigInt.fromI32(0);
  user.mgno = BigInt.fromI32(0);
  user.lgno = BigInt.fromI32(0);
  user.sgno = BigInt.fromI32(0);
  user.deposit = BigInt.fromI32(0);
  user.save();
}

createMockedFunction(
  NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
  "positions",
  "positions(uint256):(uint96,address,address,address,uint24,int24,int24,uint128,uint256,uint256,uint128,uint128)"
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(TOKEN_ID)])
  .returns([
    ethereum.Value.fromUnsignedBigInt(ZERO_BI),
    ethereum.Value.fromAddress(USER1_ADDRESS),
    ethereum.Value.fromAddress(GNO_ADDRESS),
    ethereum.Value.fromAddress(OTHER_TOKEN_ADDRESS),
    ethereum.Value.fromUnsignedBigInt(ZERO_BI),
    ethereum.Value.fromSignedBigInt(BigInt.fromI32(MIN_TICK)),
    ethereum.Value.fromSignedBigInt(BigInt.fromI32(MAX_TICK)),
    ethereum.Value.fromUnsignedBigInt(ONE_GNO),
    ethereum.Value.fromUnsignedBigInt(ZERO_BI),
    ethereum.Value.fromUnsignedBigInt(ZERO_BI),
    ethereum.Value.fromUnsignedBigInt(ZERO_BI),
    ethereum.Value.fromUnsignedBigInt(ZERO_BI),
  ]);

createMockedFunction(
  Address.fromString(FACTORY_ADDRESS),
  "getPool",
  "getPool(address,address,uint24):(address)"
)
  .withArgs([
    ethereum.Value.fromAddress(GNO_ADDRESS),
    ethereum.Value.fromAddress(OTHER_TOKEN_ADDRESS),
    ethereum.Value.fromUnsignedBigInt(ZERO_BI),
  ])
  .returns([ethereum.Value.fromAddress(PAIR_ADDRESS)]);

function createTestPosition(): void {
  const position = new ConcentratedLiquidityPosition(TOKEN_ID.toString());
  // The user gets correctly updated in the Transfer handler
  position.user = USER1_ADDRESS.toHexString();
  position.pair = PAIR_ADDRESS.toHexString();
  position.liquidity = ONE_GNO;
  position.lowerTick = BigInt.fromI32(MIN_TICK);
  position.upperTick = BigInt.fromI32(MAX_TICK);
  position.save();

  const pair = ConcentratedLiquidityPair.load(PAIR_ADDRESS.toHexString());
  if (!pair) {
    throw new Error("must call resetFixtures before createTestPosition");
  }
  pair.positions = [position.id];
  pair.save();
}

test("updates vote weight when minting new position", () => {
  resetFixtures();
  handleIncreaseLiquidity(createIncreaseLiquidityEvent(ONE_GNO));

  assert.fieldEquals(
    "ConcentratedLiquidityPosition",
    TOKEN_ID.toString(),
    "liquidity",
    "1000000000000000000"
  );

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "2000000000000000000"
  );
});

test("updates vote weight when increasing liquidity of positions", () => {
  resetFixtures();
  createTestPosition();

  // increase by 1
  handleIncreaseLiquidity(createIncreaseLiquidityEvent(ONE_GNO));

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "2000000000000000000" // 2 GNO
  );
});

test("updates vote weight when decreasing liquidity of positions", () => {
  resetFixtures();
  createTestPosition();

  // decrease by 0.1
  handleDecreaseLiquidity(
    createDecreaseLiquidityEvent(ONE_GNO.div(BigInt.fromI32(10)))
  );

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "900000000000000000" // 0.9 GNO
  );
});

test("deletes position with zero liquidity", () => {
  resetFixtures();
  createTestPosition();

  // decrease by 1 (full amount)
  handleDecreaseLiquidity(createDecreaseLiquidityEvent(ONE_GNO));

  assert.notInStore("ConcentratedLiquidityPosition", TOKEN_ID.toString());

  // also removed from pair.positions
  assert.fieldEquals(
    "ConcentratedLiquidityPair",
    PAIR_ADDRESS.toHexString(),
    "positions",
    "[]"
  );
});

test("updates vote weights when transferring a position", () => {
  resetFixtures();
  createTestPosition();

  handleTransfer(createTransferEvent(USER2_ADDRESS));

  // user 1 has zero vote weight and is deleted
  assert.notInStore("User", USER1_ADDRESS.toString());

  // user 2 got 1 GNO vote weight
  assert.fieldEquals(
    "User",
    USER2_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.toString()
  );
});

function createIncreaseLiquidityEvent(liquidity: BigInt): IncreaseLiquidity {
  const mockEvent = newMockEvent();

  mockEvent.parameters = new Array();
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(TOKEN_ID)
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "liquidity",
      ethereum.Value.fromUnsignedBigInt(liquidity)
    )
  );

  return new IncreaseLiquidity(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

function createDecreaseLiquidityEvent(liquidity: BigInt): DecreaseLiquidity {
  const mockEvent = newMockEvent();

  mockEvent.parameters = new Array();
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(TOKEN_ID)
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "liquidity",
      ethereum.Value.fromUnsignedBigInt(liquidity)
    )
  );

  return new DecreaseLiquidity(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

function createTransferEvent(to: Address): Transfer {
  const mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(USER1_ADDRESS))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(TOKEN_ID)
    )
  );

  return new Transfer(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}
