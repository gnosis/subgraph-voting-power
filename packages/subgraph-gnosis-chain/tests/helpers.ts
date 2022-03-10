import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";
import { handleTransfer } from "../src/mgno";
import { log, newMockEvent } from "matchstick-as";
import { ADDRESS_ZERO } from "../src/helpers";
import { Transfer } from "../generated/templates/Pair/ERC20";
import { Sync } from "../generated/templates/Pair/Pair";
import { PairCreated } from "../generated/Factory/Factory";

export const user1 = "0x0000000000000000000000000000000000000001";
export const user2 = "0x0000000000000000000000000000000000000002";
export const mockPair = "0x0000000000000000000000000000000000000003";
export const value = BigInt.fromI32(1337);
export const value2x = BigInt.fromI32(2674);
export const data = "0x00";

export function createTransferEvent(
  from: string,
  to: string,
  value: BigInt,
  data: string
): Transfer {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    )
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
  token1: string,
  pair: string,
  value: BigInt
): PairCreated {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam("token0", ethereum.Value.fromAddress(token0))
  );

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "token1",
      ethereum.Value.fromAddress(Address.fromString(token1))
    )
  );

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "pair",
      ethereum.Value.fromAddress(Address.fromString(pair))
    )
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
