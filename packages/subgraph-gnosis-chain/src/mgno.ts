import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Transfer } from '../generated/ds-mgno/MGNO';

import { MGNO } from '../generated/schema';

import { increase as increasePower } from './votingPower';
import { decrease as decreasePower } from './votingPower';

// NOTE: this should probably use a subgraph template. copy from gno

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;
  const value = event.params.value;

  if (!isSpecialAddress(from)) {
    writeEntity(event, from, (prevBalance, value) => prevBalance.minus(value));
    decreasePower(from, value.div(BigInt.fromI32(32)));
  }

  if (!isSpecialAddress(to)) {
    writeEntity(event, to, (prevBalance, value) => prevBalance.plus(value));
    increasePower(to, value.div(BigInt.fromI32(32)));
  }
}

function writeEntity(
  event: Transfer,
  address: Address,
  updateBalance: (prevBalance: BigInt, value: BigInt) => BigInt
): void {
  const id = address.toHexString();

  let entry = MGNO.load(id);
  if (!entry) {
    entry = new MGNO(id);
    entry.address = address;
    entry.balance = BigInt.fromI32(0);
  }

  entry.balance = updateBalance(entry.balance, event.params.value);
  entry.block = event.block.number;
  entry.modified = event.block.timestamp;
  entry.transaction = event.transaction.hash;

  entry.save();
}

const ZERO = Address.fromHexString(
  '0x0000000000000000000000000000000000000000'
);
const WRAPPER = Address.fromHexString(
  '0x647507A70Ff598F386CB96ae5046486389368C66'
);

const DEPOSIT = Address.fromHexString(
  '0x0B98057eA310F4d31F2a452B414647007d1645d9'
);

function isSpecialAddress(a: Address): bool {
  return a.equals(ZERO) || a.equals(WRAPPER) || a.equals(DEPOSIT);
}
