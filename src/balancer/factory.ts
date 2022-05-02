import { Address, log } from "@graphprotocol/graph-ts";
import { PoolCreated } from "../../generated/WeightedPoolFactory/WeightedPoolFactory";
import { WeightedPool as WeightedPoolTemplate } from "../../generated/templates";
import { Vault } from "../../generated/Vault/Vault";
import { WeightedPool } from "../../generated/schema";
import { WeightedPool as WeightedPoolContract } from "../../generated/WeightedPoolFactory/WeightedPool";
import { GNO_ADDRESS, ZERO_BI } from "../helpers";

const VAULT_ADDRESS = Address.fromString(
  "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
);

export function handlePoolCreated(event: PoolCreated): void {
  const address = event.params.pool;
  const poolContract = WeightedPoolContract.bind(address);

  const poolIdCall = poolContract.try_getPoolId();
  const poolId = poolIdCall.value;

  const vaultContract = Vault.bind(VAULT_ADDRESS);
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

      WeightedPoolTemplate.create(address);
    }
  } else {
    log.warning("getPoolTokens call reverted for pool ID {}", [
      poolId.toHexString(),
    ]);
  }
}
