import { log } from "@graphprotocol/graph-ts";
import { LOG_NEW_POOL } from "../../generated-gc/ds-balancer-v1-factory/Factory";
import { Pool as PoolContract } from "../../generated-gc/templates/BalancerV1Pool/Pool";

import { WeightedPool } from "../../generated/schema";

import { BalancerV1Pool as BalancerV1PoolTemplate } from "../../generated-gc/templates";

import { GNO_ADDRESS, ZERO_BI } from "../constants";

export function handleNewPool(event: LOG_NEW_POOL): void {
  const address = event.params.pool;

  const poolContract = PoolContract.bind(address);

  const currentTokensCall = poolContract.try_getCurrentTokens();
  if (!currentTokensCall.reverted) {
    const tokens = currentTokensCall.value;
    if (tokens.some(token => token.equals(GNO_ADDRESS))) {
      const pool = new WeightedPool(address.toHexString());
      pool.positions = [];
      pool.totalSupply = ZERO_BI;
      pool.gnoBalance = ZERO_BI;
      pool.gnoIsFirst = false;
      pool.save();
      log.info("instantiated WeightedPool instance: {}", [
        address.toHexString(),
      ]);

      BalancerV1PoolTemplate.create(address);
    }
  }
}
