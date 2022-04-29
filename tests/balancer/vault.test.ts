import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  clearStore,
  test,
  assert,
  newMockEvent,
  createMockedFunction,
} from "matchstick-as/assembly/index";
import { User, WeightedPool, WeightedPoolPosition } from "..//generated/schema";
import { Transfer as GnoTransfer } from "..//generated/ds-gno/ERC20";
import { GNO_ADDRESS, ONE_GNO, ZERO_BI } from "..//src/helpers";
import { USER1_ADDRESS, USER2_ADDRESS } from "..//tests/helpers";
import {
  handleInternalBalanceChange,
  handleSwap,
} from "../../src/balancer/vault";
import { InternalBalanceChanged, Swap } from "../../generated/Vault/Vault";
import { handleTransfer } from "..//src/gno";

const POOL_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
const OTHER_TOKEN_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000002222"
);

const VAULT_ADDRESS = Address.fromString(
  "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
);

const POOL_ID = POOL_ADDRESS.concat(Bytes.fromHexString("0x0000123123"));

const HALF_A_GNO = ONE_GNO.div(BigInt.fromI32(2));

function resetFixtures(): void {
  clearStore();

  // Create pool with total supply of 1e18
  const pool = new WeightedPool(POOL_ADDRESS.toHexString());
  pool.gnoIsFirst = true;
  pool.totalSupply = ONE_GNO;
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

  // give 1 GNO balance to the pool
  const poolUser = new User(POOL_ADDRESS.toHexString());
  poolUser.voteWeight = ONE_GNO;
  poolUser.gno = ONE_GNO;
  poolUser.mgno = BigInt.fromI32(0);
  poolUser.lgno = BigInt.fromI32(0);
  poolUser.deposit = BigInt.fromI32(0);
  poolUser.save();
}

createMockedFunction(
  POOL_ADDRESS,
  "getPoolId",
  "getPoolId():(bytes32)"
).returns([ethereum.Value.fromBytes(POOL_ID)]);

createMockedFunction(
  VAULT_ADDRESS,
  "getPoolTokens",
  "getPoolTokens(bytes32):(address[],uint256[],uint256)"
)
  .withArgs([ethereum.Value.fromFixedBytes(POOL_ID)])
  .returns([
    ethereum.Value.fromAddressArray([GNO_ADDRESS, OTHER_TOKEN_ADDRESS]),
    ethereum.Value.fromUnsignedBigIntArray([ONE_GNO, ONE_GNO]),
    ethereum.Value.fromUnsignedBigInt(ZERO_BI),
  ]);

test("Updates vote weights of LPs on swaps changing the pool's GNO balance", () => {
  resetFixtures();

  handleTransfer(
    createGnoTransferEvent(POOL_ADDRESS, USER2_ADDRESS, HALF_A_GNO)
  );
  handleSwap(createSwapEvent(HALF_A_GNO));

  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    HALF_A_GNO.toString()
  );
});

test("Accounts for internal balances", () => {
  resetFixtures();
  handleInternalBalanceChange(createInternalBalanceChangedEvent(ONE_GNO));

  // add 1 GNO to internal balance
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "balancerInternalGno",
    ONE_GNO.toString()
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.plus(ONE_GNO).toString()
  );

  // subtract 0.5 GNO from internal balance
  handleInternalBalanceChange(
    createInternalBalanceChangedEvent(HALF_A_GNO.neg())
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "balancerInternalGno",
    HALF_A_GNO.toString()
  );
  assert.fieldEquals(
    "User",
    USER1_ADDRESS.toHexString(),
    "voteWeight",
    ONE_GNO.plus(HALF_A_GNO).toString()
  );
});

function createSwapEvent(gnoOut: BigInt): Swap {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();
  mockEvent.parameters.push(
    new ethereum.EventParam("poolId", ethereum.Value.fromBytes(POOL_ID))
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
      "amountIn",
      ethereum.Value.fromSignedBigInt(BigInt.fromI32(1000000000))
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "amountOut",
      ethereum.Value.fromSignedBigInt(gnoOut)
    )
  );

  return new Swap(
    VAULT_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
}

function createInternalBalanceChangedEvent(
  delta: BigInt
): InternalBalanceChanged {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(USER1_ADDRESS))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(GNO_ADDRESS))
  );

  mockEvent.parameters.push(
    new ethereum.EventParam("delta", ethereum.Value.fromSignedBigInt(delta))
  );

  return new InternalBalanceChanged(
    VAULT_ADDRESS,
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
