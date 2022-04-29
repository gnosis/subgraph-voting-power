import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { PairCreated } from "../generated-gc/Sushi/Factory";
import { Transfer } from "../generated-gc/templates/Pair/ERC20";
import { Sync } from "../generated-gc/templates/Pair/Pair";

export const ADDRESS_ZERO = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
export const USER1_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000001"
);
export const USER2_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000002"
);
export const PAIR_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000003"
);
export const FACTORY_ADDRESS = Address.fromString(
  "0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7"
);

export const OTHERTOKEN_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000004"
);
export const value = BigInt.fromI32(2000000);
export const value2x = BigInt.fromI32(4000000);

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt,
  data: string
): Transfer {
  let mockEvent = newMockEvent();

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

  let newTransferEvent = new Transfer(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  return newTransferEvent;
}

export function createSyncEvent(reserve0: BigInt, reserve1: BigInt): Sync {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromSignedBigInt(reserve0))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromSignedBigInt(reserve1))
  );

  let newSyncEvent = new Sync(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  return newSyncEvent;
}

export function createPairCreatedEvent(
  token0: Address,
  token1: Address,
  pair: Address,
  value: BigInt
): PairCreated {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("token0", ethereum.Value.fromAddress(token0))
  );

  mockEvent.parameters.push(
    new ethereum.EventParam("token1", ethereum.Value.fromAddress(token1))
  );

  mockEvent.parameters.push(
    new ethereum.EventParam("pair", ethereum.Value.fromAddress(pair))
  );

  mockEvent.parameters.push(
    new ethereum.EventParam("", ethereum.Value.fromSignedBigInt(value))
  );

  let newPairCreatedEvent = new PairCreated(
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
