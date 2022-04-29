import {
  clearStore,
  test,
  assert,
  newMockEvent,
} from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handlePoolCreated } from "../../src/balancer/factory";
import { USER1_ADDRESS } from "../helpers";
import { PoolCreated } from "../../generated/WeightedPoolFactory/WeightedPoolFactory";

const POOL_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);

test("Factory spawns pool", () => {
  clearStore();
  const otherToken = USER1_ADDRESS;
  const poolCreatedEvent = createPoolCreatedEvent(POOL_ADDRESS);
  handlePoolCreated(poolCreatedEvent);
  assert.fieldEquals(
    "WeightedPool",
    POOL_ADDRESS.toHexString(),
    "id",
    POOL_ADDRESS.toHexString()
  );
});

export function createPoolCreatedEvent(pool: Address): PoolCreated {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();
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
