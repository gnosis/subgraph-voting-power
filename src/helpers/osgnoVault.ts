import { BigInt, } from "@graphprotocol/graph-ts";
import { VaultState } from "../../generated/schema";

export function loadOrCreateVault(): VaultState {
    let vaultState = VaultState.load("VAULT_STATE");
    if (vaultState == null) {
        vaultState = new VaultState("VAULT_STATE");
        vaultState.profitAccrued = BigInt.fromI32(0);
        vaultState._totalShares = BigInt.fromI32(0);
        vaultState._totalAssets = BigInt.fromI32(0);
        vaultState.lastUpdatedTimeStamp = BigInt.fromString("55776895775");
        vaultState.avgRewardPerSecond = BigInt.fromI32(0);
        vaultState.feePercent = 0;
        vaultState.save();
    }
    return vaultState;
}
