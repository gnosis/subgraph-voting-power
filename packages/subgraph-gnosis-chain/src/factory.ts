/* eslint-disable prefer-const */
import { Address, log } from '@graphprotocol/graph-ts';
import { PairCreated } from '../generated/Factory/Factory';
import { Pair } from '../generated/templates';

const GNO = Address.fromHexString('0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb');

export function handleNewPair(event: PairCreated): void {
  const isGnoTradingPair =
    event.params.token0.equals(GNO) || event.params.token1.equals(GNO);

  if (isGnoTradingPair) {
    Pair.create(event.params.pair);
  }
}
