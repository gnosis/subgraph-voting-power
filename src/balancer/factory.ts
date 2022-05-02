import { Address, log } from "@graphprotocol/graph-ts";

import { WeightedPool } from "../../generated/schema";
import { Vault as VaultContract } from "../../generated/ds-balancer-factory/Vault";
import { WeightedPool as WeightedPoolContract } from "../../generated/ds-balancer-factory/WeightedPool";
import { PoolCreated as PoolCreatedEvent } from "../../generated/ds-balancer-factory/WeightedPoolFactory";

import { BalancerPool as BalancerPoolTemplate } from "../../generated/templates";

import { GNO_ADDRESS, ZERO_BI } from "../helpers";

const VAULT_ADDRESS = Address.fromString(
  "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
);

export function handlePoolCreated(event: PoolCreatedEvent): void {
  const address = event.params.pool;
  const poolContract = WeightedPoolContract.bind(address);

  const poolIdCall = poolContract.try_getPoolId();
  const poolId = poolIdCall.value;

  const vaultContract = VaultContract.bind(VAULT_ADDRESS);
  const tokensCall = vaultContract.try_getPoolTokens(poolId);
  if (!tokensCall.reverted) {
    const tokens = tokensCall.value.value0;
    if (tokens.some(token => token.equals(GNO_ADDRESS))) {
      const pool = new WeightedPool(address.toHexString());
      pool.positions = [];
      pool.totalSupply = ZERO_BI;
      pool.gnoBalance = ZERO_BI;
      pool.gnoIsFirst = false;
      pool.save();
      log.info("instantiated WeightedPool instance: {}", [
        poolId.toHexString(),
      ]);

      BalancerPoolTemplate.create(address);
    }
  }
}
