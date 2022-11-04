import {
  clearStore,
  test,
  assert,
  newMockEvent,
  createMockedFunction,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { handlePoolCreated, VAULT_ADDRESS } from "../../src/balancerV2/factory";
import { PoolCreated } from "../../generated/ds-balancer-v2-factory/WeightedPoolFactory";
import { GNO_ADDRESS } from "../../src/constants";
import { OTHERTOKEN_ADDRESS } from "../helpers";

const POOL_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);

createMockedFunction(
  POOL_ADDRESS,
  "getPoolId",
  "getPoolId():(bytes32)"
).returns([ethereum.Value.fromFixedBytes(Bytes.fromHexString("0x1234"))]);

createMockedFunction(
  VAULT_ADDRESS,
  "getPoolTokens",
  "getPoolTokens(bytes32):(address[],uint256[],uint256)"
)
  .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString("0x1234"))])
  .returns([
    ethereum.Value.fromAddressArray([GNO_ADDRESS, OTHERTOKEN_ADDRESS]),
    ethereum.Value.fromUnsignedBigIntArray([BigInt.zero(), BigInt.zero()]),
    ethereum.Value.fromUnsignedBigInt(BigInt.zero()),
  ]);

test("Factory spawns pool", () => {
  clearStore();
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
