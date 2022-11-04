import { Transfer } from "../../generated-gc/ds-curve-sgno-gno/ERC20";

import { ZERO_BI } from "../constants";
import { Address, log } from "@graphprotocol/graph-ts";
import { User, WeightedPool } from "../../generated/schema";
import { handleTransfer as handleTransferForWeightedPool } from "../helpers/weightedPool";

export const SGNO_GNO_POOL_ADDRESS = Address.fromString(
  "0xBdF4488Dcf7165788D438b62B4C8A333879B7078"
);

export function handleTransfer(event: Transfer): void {
  const id = event.address.toHexString();
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;

  // for Curve the we have the following ordering of events:
  // - reserve0 token transfer event
  // - reserve1 token transfer event
  // - LP token transfer event
  // - AddLiquidity/RemoveLiquidity event
  // As handleTransferForWeightedPool relies on the pools GNO balance being up-to-date,
  // we make sure it is, adding the balances of GNO and SGNO
  const pool = loadOrCreateSgnoGnoPool();
  if (!pool) throw new Error(`Expected WeightedPool #${id} to exist`);
  const userEntryForPool = User.load(id);
  pool.gnoBalance = userEntryForPool
    ? userEntryForPool.gno.plus(userEntryForPool.sgno)
    : ZERO_BI;
  pool.save();

  handleTransferForWeightedPool(event, from, to, value);
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
