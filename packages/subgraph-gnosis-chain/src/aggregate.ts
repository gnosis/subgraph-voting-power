import { BigInt } from '@graphprotocol/graph-ts';

import { Aggregate } from '../generated/schema';

export function increase(id: string, amount: BigInt): Aggregate {
  const entry = loadOrCreate(id);
  entry.eventCount += 1;
  entry.sum = entry.sum.plus(amount);
  return entry;
}

export function decrease(id: string, amount: BigInt): Aggregate {
  const entry = loadOrCreate(id);
  entry.eventCount += 1;
  entry.sum = entry.sum.minus(amount);
  return entry;
}

function loadOrCreate(id: string): Aggregate {
  let entry = Aggregate.load(id);
  if (!entry) {
    entry = new Aggregate(id);
    entry.eventCount = 0;
    entry.addressCount = 0;
    entry.sum = BigInt.fromI32(0);
  }

  return entry;
}
