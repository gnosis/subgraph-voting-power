import { log, BigInt, Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated-gc/ds-curve-sgno-gno/CurveStableSwap";

import { ZERO_BI } from "../constants";
import {
  User,
  WeightedPool,
  WeightedPoolPosition,
} from "../../generated/schema";
import {
  handleBalanceChange as handleBalanceChangeForWeightedPool,
  handleTransfer as handleTransferForWeightedPool,
} from "../helpers/weightedPool";
import { loadOrCreate as loadOrCreateUser } from "../helpers/user";

export const SGNO_GNO_POOL_ADDRESS = Address.fromString(
  "0xBdF4488Dcf7165788D438b62B4C8A333879B7078"
);

const ID = SGNO_GNO_POOL_ADDRESS.toHexString();

export function handleTransfer(event: Transfer): void {
  const from = event.params.sender;
  const to = event.params.receiver;
  const value = event.params.value;

  // for Curve the we have the following ordering of events:
  // - reserve0 token transfer event
  // - reserve1 token transfer event
  // - LP token transfer event

  // As handleTransferForWeightedPool relies on the pools GNO balance being up-to-date,
  // we make sure it is, adding the balances of GNO and SGNO
  const pool = loadOrCreateSgnoGnoPool();
  if (!pool) throw new Error(`Expected WeightedPool #${ID} to exist`);
  const userEntryForPool = User.load(ID);
  pool.gnoBalance = userEntryForPool
    ? userEntryForPool.gno.plus(userEntryForPool.sgno)
    : ZERO_BI;
  pool.save();

  handleTransferForWeightedPool(SGNO_GNO_POOL_ADDRESS, from, to, value);
}

export function handlePoolBalanceChange(): void {
  // This handler is called for any event that might involve and update to the total balance of GNO and SGNO.
  // All handled events are only emmitted after any Transfer events of pool or LP tokens.

  const pool = loadOrCreateSgnoGnoPool();
  if (!pool) throw new Error(`Expected WeightedPool #${ID} to exist`);
  const gnoBalance = pool.gnoBalance;
  const userEntryForPool = User.load(ID);
  const nextGnoBalance = userEntryForPool
    ? userEntryForPool.gno.plus(userEntryForPool.sgno)
    : ZERO_BI;

  if (!nextGnoBalance.equals(gnoBalance)) {
    // update vote weight of LPs
    handleBalanceChangeForWeightedPool(pool, gnoBalance);
    // update stakedGnoSgno breakdown of LPs that stake their LP tokens
    handleBalanceChangeForStakedGnoSgno(pool, gnoBalance, nextGnoBalance);
  }
}

function loadOrCreateSgnoGnoPool(): WeightedPool {
  const id = SGNO_GNO_POOL_ADDRESS.toHexString();
  let pool = WeightedPool.load(id);
  if (!pool) {
    pool = new WeightedPool(id);
    pool.positions = [];
    pool.totalSupply = ZERO_BI;
    pool.gnoBalance = ZERO_BI;
    pool.gnoIsFirst = false;
    pool.save();
    log.info("instantiated WeightedPool instance for SGNO/GNO Curve pool: {}", [
      id,
    ]);
  }
  return pool;
}

function handleBalanceChangeForStakedGnoSgno(
  pool: WeightedPool,
  gnoBalance: BigInt,
  nextGnoBalance: BigInt
): void {
  if (pool.positions) {
    for (let index = 0; index < pool.positions.length; index++) {
      const position = WeightedPoolPosition.load(pool.positions[index]);
      if (position) {
        const user = loadOrCreateUser(Address.fromString(position.user));

        const previousStakedGnoSgno = user.stakedGnoSgno;
        user.stakedGnoSgno = user.stakedGnoSgno
          .times(nextGnoBalance)
          .div(gnoBalance); // scale user's staked balance by the change in pool's GNO balance
        user.save();

        log.info("updated staked GNO/sGNO balance of user {} (was: {})", [
          user.id,
          user.stakedGnoSgno.toString(),
          previousStakedGnoSgno.toString(),
        ]);
      }
    }
  }
}
