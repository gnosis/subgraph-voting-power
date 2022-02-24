import { BigInt } from '@graphprotocol/graph-ts';
import { DepositEvent } from '../generated/ds-deposit/SBCDepositContract';
import { loadOrCreate } from './balance';

const depositAmount = BigInt.fromString('32000000000000000000');

export function handleDeposit(event: DepositEvent): void {
  const user = event.transaction.from;

  const balance = loadOrCreate(user);
  balance.deposit = balance.deposit.plus(depositAmount);
  balance.save();
}
