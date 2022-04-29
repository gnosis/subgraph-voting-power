import {
  clearStore,
  test,
  assert,
  newMockEvent,
} from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handlePoolCreated } from "../../src/uniswapV3/factory";
import { PoolCreated } from "../../generated/Factory/Factory";
import { GNO_ADDRESS } from "../../src/helpers";
import { PAIR_ADDRESS, USER1_ADDRESS } from "../helpers";

test("Factory spawns pair", () => {
  clearStore();
  const otherToken = USER1_ADDRESS;
  const poolCreatedEvent = createPoolCreatedEvent(
    GNO_ADDRESS,
    otherToken,
    PAIR_ADDRESS
  );
  handlePoolCreated(poolCreatedEvent);
  assert.fieldEquals(
    "ConcentratedLiquidityPair",
    PAIR_ADDRESS.toHexString(),
    "id",
    PAIR_ADDRESS.toHexString()
  );
});

export function createPoolCreatedEvent(
  token0: Address,
  token1: Address,
  pool: Address
): PoolCreated {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("token0", ethereum.Value.fromAddress(token0))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("token1", ethereum.Value.fromAddress(token1))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromI32(1))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("tickSpacing", ethereum.Value.fromI32(1))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("pool", ethereum.Value.fromAddress(pool))
  );

  let newPairCreatedEvent = new PoolCreated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  return newPairCreatedEvent;
}
