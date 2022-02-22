import { Address, BigInt } from '@graphprotocol/graph-ts';
import { DepositEvent } from '../generated/ds-deposit/SBCDepositContract';

import { Deposit } from '../generated/schema';

import { increase as increasePower } from './votingPower';

const depositAmount = BigInt.fromString('32000000000000000000');
const powerGained = depositAmount.div(BigInt.fromI32(32));

export function handleDeposit(event: DepositEvent): void {
  const user = event.transaction.from;
  const id = user.toHex();

  let entry = Deposit.load(id);
  if (!entry) {
    entry = new Deposit(id);
    entry.address = user;
    entry.balance = BigInt.fromI32(0);
  }
  entry.balance = entry.balance.plus(depositAmount);
  increasePower(user, powerGained);
  entry.save();
}
