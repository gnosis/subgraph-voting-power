import { BigInt } from '@graphprotocol/graph-ts';
import {
  DepositCall,
  WithdrawCall,
} from '../generated/ds-token-lock/tokenLock';

import { LGNO } from '../generated/schema';
import { log } from '@graphprotocol/graph-ts';

import {
  increase as increasePower,
  decrease as decreasePower,
} from './votingPower';

// Note there is a little bug on the event emission, switched arguments
// so for this contract I elected to react on function calls
// instead of events

export function handleDeposit(call: DepositCall): void {
  const id = call.from.toHexString();
  const address = call.from;
  const amount = call.inputs.amount;

  let entry = LGNO.load(id);
  if (!entry) {
    entry = new LGNO(id);
    entry.address = address;
    entry.balance = BigInt.fromI32(0);
  }
  entry.balance = entry.balance.plus(amount);
  increasePower(address, amount);
  entry.save();
}

export function handleWithdraw(call: WithdrawCall): void {
  const id = call.from.toHexString();
  const address = call.from;
  const amount = call.inputs.amount;

  const entry = LGNO.load(id);
  if (!entry) {
    log.error('Withdraw without previous deposit:', [
      call.transaction.hash.toHexString(),
      address.toHexString(),
      amount.toString(),
    ]);
    return;
  }

  entry.balance = entry.balance.minus(amount);
  decreasePower(address, amount);
  entry.save();
}
