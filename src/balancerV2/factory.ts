import { Address, log } from "@graphprotocol/graph-ts";

import { Vault as VaultContract } from "../../generated/ds-balancer-v2-factory/Vault";
import { WeightedPool as WeightedPoolContract } from "../../generated/ds-balancer-v2-factory/WeightedPool";
import { PoolCreated as PoolCreatedEvent } from "../../generated/ds-balancer-v2-factory/WeightedPoolFactory";

import { WeightedPool } from "../../generated/schema";

import { BalancerV2Pool as BalancerV2PoolTemplate } from "../../generated/templates";

import { GNO_ADDRESS, ZERO_BI } from "../constants";

export const VAULT_ADDRESS = Address.fromString(
  "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
);

export function handlePoolCreated(event: PoolCreatedEvent): void {
  const address = event.params.pool;
  const poolContract = WeightedPoolContract.bind(address);

  const poolIdCall = poolContract.try_getPoolId();
  const poolId = poolIdCall.value;

  const vaultContract = VaultContract.bind(VAULT_ADDRESS);
  log.info("poolId: {}", [poolId.toHexString()]);
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
      log.info("instantiated Balancer WeightedPool instance: {}", [
        poolId.toHexString(),
      ]);

      BalancerV2PoolTemplate.create(address);
    }
  } else {
    log.warning("getPoolTokens call reverted for pool ID {}", [
      poolId.toHexString(),
    ]);
  }
}
