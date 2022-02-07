import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Swap } from '../generated/ds-staking-lock/SBCWrapper';

import { log } from '@graphprotocol/graph-ts';

import { MGNO } from '../generated/schema';

import { increase as increasePower } from './votingPower';

const GNOAddress = Address.fromHexString(
  '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb'
);

export function handleSwap(event: Swap): void {
  const token = event.params.token;
  const user = event.params.user;
  const amount = event.params.amount;
  const received = event.params.received;

  if (token.equals(GNOAddress)) {
    const id = user.toHexString();

    let entry = MGNO.load(id);
    if (!entry) {
      entry = new MGNO(id);
      entry.address = user;
      entry.balance = BigInt.fromI32(0);
    }
    entry.balance = entry.balance.plus(received);
    increasePower(user, amount);
    entry.save();
  } else {
    log.info('Swap for non GNO was detected', [
      token.toHexString(),
      user.toHexString(),
      amount.toHexString(),
      received.toHexString(),
    ]);
  }
}
