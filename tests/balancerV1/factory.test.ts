import {
  clearStore,
  test,
  assert,
  newMockEvent,
  createMockedFunction,
} from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handleNewPool } from "../../src/balancerV1/factory";
import { OTHERTOKEN_ADDRESS, USER1_ADDRESS } from "../helpers";
import { LOG_NEW_POOL } from "../../generated-gc/ds-balancer-v1-factory/Factory";
import { GNO_ADDRESS } from "../../src/constants";

const POOL_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);

createMockedFunction(
  POOL_ADDRESS,
  "getCurrentTokens",
  "getCurrentTokens():(address[])"
).returns([ethereum.Value.fromAddressArray([GNO_ADDRESS, OTHERTOKEN_ADDRESS])]);

test("Factory spawns pool", () => {
  clearStore();
  const poolCreatedEvent = createPoolCreatedEvent(POOL_ADDRESS);
  handleNewPool(poolCreatedEvent);
  assert.fieldEquals(
    "WeightedPool",
    POOL_ADDRESS.toHexString(),
    "id",
    POOL_ADDRESS.toHexString()
  );
});

export function createPoolCreatedEvent(pool: Address): LOG_NEW_POOL {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();
  mockEvent.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(USER1_ADDRESS))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("pool", ethereum.Value.fromAddress(pool))
  );

  return new LOG_NEW_POOL(
    Address.fromString("0x9B4214FD41cD24347A25122AC7bb6B479BED72Ac"),
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    null
  );
}
