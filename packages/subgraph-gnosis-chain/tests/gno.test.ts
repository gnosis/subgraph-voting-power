import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { User } from '../generated/schema'
import { GNO } from '../generated/ds-gno/GNO'
import { Transfer } from "../generated/ds-gno/GNO";
import { createTranserEvent, handleTransfer } from '../src/gno'

export function runTests(): void {
  test('Can call mappings with custom events', () => {
    // Initialise
    let user = new User('gravatarId0')
    user.save()

    // Call mappings
    let value = BigInt.fromI32(1337)
    let toAddress = Address.fromString('0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7')
    let fromAddress = Address.fromString('0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7')
    let data = '0x01'
    let newTransferEvent = createTranserEvent(12345, fromAddress, toAddress, value, data)
    // let anotherGravatarEvent = createNewGravatarEvent(3546, '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7', 'cap', 'pac')

    handleTransfer(newTransferEvent)

    assert.fieldEquals('User', 'gravatarId0', 'id', 'test')
    // assert.fieldEquals('Gravatar', '12345', 'owner', '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7')
    // assert.fieldEquals('Gravatar', '3546', 'displayName', 'cap')

    clearStore()
  })

  test('Next test', () => {
    //...
  })
}