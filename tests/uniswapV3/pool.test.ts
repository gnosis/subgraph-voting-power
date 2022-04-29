import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import {
  ConcentratedLiquidityPair,
  ConcentratedLiquidityPosition,
} from "../../generated/schema";
import { newMockEvent } from "matchstick-as";
import { handleInitialize, handleSwap } from "../../src/uniswapV3/pool";
import { ONE_GNO, ZERO_BD } from "..//src/helpers";
import { Initialize, Swap } from "../../generated/templates/Pool/Pool";
import { User } from "..//generated/schema";

const PAIR_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
export const USER1_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);

const initializeEvent = createInitializeEvent();

const MIN_TICK = -887272;
const MAX_TICK = -MIN_TICK;

function resetFixtures(): void {
  clearStore();

  const pair = new ConcentratedLiquidityPair(PAIR_ADDRESS.toHexString());
  pair.gnoIsFirst = true;
  pair.sqrtRatio = ZERO_BD;
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

test("initializes with the correct sqrtRatio decimal", () => {
  resetFixtures();

  handleInitialize(initializeEvent);

  assert.fieldEquals(
    "ConcentratedLiquidityPair",
    PAIR_ADDRESS.toHexString(),
    "sqrtRatio",
    "1"
  );
});

test("swaps correctly update the sqrtRatio", () => {
  resetFixtures();
  handleInitialize(initializeEvent);

  handleSwap(createSwapEvent(2));
  assert.fieldEquals(
    "ConcentratedLiquidityPair",
    PAIR_ADDRESS.toHexString(),
    "sqrtRatio",
    "2"
  );

  handleSwap(createSwapEvent(1, 2));
  assert.fieldEquals(
    "ConcentratedLiquidityPair",
    PAIR_ADDRESS.toHexString(),
    "sqrtRatio",
    "0.5"
  );
});

test("updates vote weight after swaps", () => {
  resetFixtures();
  handleInitialize(initializeEvent);

  // create position over full range
  const position = new ConcentratedLiquidityPosition("1234567890");
  position.user = USER1_ADDRESS.toHexString();
  position.pair = PAIR_ADDRESS.toHexString();
  position.liquidity = ONE_GNO;
  position.lowerTick = BigInt.fromI32(MIN_TICK);
  position.upperTick = BigInt.fromI32(MAX_TICK);
  position.save();
  const pair = ConcentratedLiquidityPair.load(PAIR_ADDRESS.toHexString());
  if (!pair) throw new Error("should never happen");
  pair.positions = pair.positions.concat(["1234567890"]);
  pair.save();
  assert.fieldEquals(
    "ConcentratedLiquidityPair",
    PAIR_ADDRESS.toHexString(),
    "sqrtRatio",
    "1"
  );

  // sqrtRatio changes from 1/1 (x=1, y=1) to 1/2 => ratio changes to 1/4
  // x=2 GNO reserves, y=0.5 other token reserves (preserving x*y=k)
  handleSwap(createSwapEvent(1, 2));
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    "1999999999999999999" // there is some rounding error
  );
});

function createInitializeEvent(): Initialize {
  const mockEvent = newMockEvent();

  mockEvent.parameters = new Array();
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "sqrtPriceX96",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2).pow(96))
    )
  );

  return new Initialize(
    PAIR_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

function createSwapEvent(
  sqrtRatioNumerator: i32,
  sqrtRatioDenominator: i32 = 1
): Swap {
  const mockEvent = newMockEvent();

  mockEvent.parameters = new Array();
  mockEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(USER1_ADDRESS))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "recipient",
      ethereum.Value.fromAddress(USER1_ADDRESS)
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("amount0", ethereum.Value.fromI32(0))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("amount1", ethereum.Value.fromI32(0))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "sqrtPriceX96",
      ethereum.Value.fromUnsignedBigInt(
        BigInt.fromI32(2)
          .pow(96)
          .times(BigInt.fromI32(sqrtRatioNumerator))
          .div(BigInt.fromI32(sqrtRatioDenominator))
      )
    )
  );

  return new Swap(
    PAIR_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}
