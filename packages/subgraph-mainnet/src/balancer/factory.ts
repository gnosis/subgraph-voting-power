import { PoolCreated } from "../../generated/WeightedPoolFactory/WeightedPoolFactory";
import { WeightedPool as WeightedPoolTemplate } from "../../generated/templates";
import { WeightedPool as WeightedPoolContract } from "../../generated/WeightedPoolFactory/WeightedPool";
import { Address, log } from "@graphprotocol/graph-ts";
import { Vault } from "../../generated/Vault/Vault";
import { GNO_ADDRESS } from "../../../subgraph-base/src/helpers";
import { WeightedPool } from "../../../subgraph-base/generated/schema";

const VAULT_ADDRESS = Address.fromString(
  "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
);

export function handleNewWeightedPool(event: PoolCreated): void {
  const address = event.params.pool;
  const poolContract = WeightedPoolContract.bind(address);

  const poolIdCall = poolContract.try_getPoolId();
  const poolId = poolIdCall.value;

  const vaultContract = Vault.bind(VAULT_ADDRESS);
  const tokensCall = vaultContract.try_getPoolTokens(poolId);
  if (!tokensCall.reverted) {
    const tokens = tokensCall.value.value0;
    if (tokens.some((token) => token.equals(GNO_ADDRESS))) {
      const id = address.toHexString();
      const pool = new WeightedPool(id);
      log.info("instantiated WeightedPool instance: {}", [id]);

      WeightedPoolTemplate.create(address);
    }
  }
}
