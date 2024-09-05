import { log, BigInt, Address, store } from "@graphprotocol/graph-ts";
import { VaultState } from "../../generated/schema";
import { ADDRESS_ZERO } from "../constants";

export function loadOrCreateVault(): VaultState {
    let vaultState = VaultState.load("VAULT_STATE");
    if (vaultState == null) {
        vaultState = new VaultState("VAULT_STATE");
        vaultState.profitAccrued = BigInt.fromI32(0);
        vaultState.treasuryShare = BigInt.fromI32(0);
        vaultState.treasuryAsset = BigInt.fromI32(0);
        vaultState.lastUpdatedTimeStamp = BigInt.fromI32(0);
        vaultState.avgRewardPerSecond = BigInt.fromI32(0);
        vaultState.feePercent = 0;
        vaultState.save();
    }
    return vaultState;
}
