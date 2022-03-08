import { Address, Bytes, BigInt, store, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { Transfer } from "../generated/ds-gno/GNO";
import { loadOrCreateUser, ADDRESS_ZERO } from "./helpers";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  if (from.toHexString() != ADDRESS_ZERO) {
    const userFrom = loadOrCreateUser(from);
    userFrom.gno = userFrom.gno.minus(event.params.value);
    userFrom.voteWeight = userFrom.voteWeight.minus(event.params.value);
    if (userFrom.voteWeight == BigInt.fromI32(0)) {
      store.remove("User", userFrom.id);
    } else {
      userFrom.save();
    }
  }

  if (to.toHexString() != ADDRESS_ZERO) {
    const userTo = loadOrCreateUser(to);
    userTo.gno = userTo.gno.plus(event.params.value);
    userTo.voteWeight = userTo.voteWeight.plus(event.params.value);
    userTo.save();
  }
}

export function createTranserEvent(
  id: i32,
  from: Address,
  to: Address,
  value: BigInt,
  data: string
): Transfer {
  let mockEvent = newMockEvent()
  let newTransferEvent = new Transfer(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  newTransferEvent.parameters = new Array()
  let idParam = new ethereum.EventParam('id', ethereum.Value.fromI32(id))
  let addressFromParam = new ethereum.EventParam(
    'fromAddress',
    ethereum.Value.fromAddress(from)
  )
  let addressToParam = new ethereum.EventParam(
    'toAddress',
    ethereum.Value.fromAddress(to)
  )
  let valueParam = new ethereum.EventParam('value', ethereum.Value.fromUnsignedBigInt(value))
  let dataParam = new ethereum.EventParam('data', ethereum.Value.fromString(data))
  // let displayNameParam = new ethereum.EventParam('displayName', ethereum.Value.fromString(displayName))
  // let imageUrlParam = new ethereum.EventParam('imageUrl', ethereum.Value.fromString(imageUrl))

  newTransferEvent.parameters.push(idParam)
  newTransferEvent.parameters.push(addressFromParam)
  newTransferEvent.parameters.push(addressToParam)
  newTransferEvent.parameters.push(valueParam)
  newTransferEvent.parameters.push(dataParam)

  return newTransferEvent
}

export { runTests } from "../tests/gno.test";