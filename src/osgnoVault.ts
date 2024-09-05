import { BigInt } from "@graphprotocol/graph-ts";
import { Burn, Mint, StateUpdated } from "../generated-gc/ds-osgno-vault/OsTokenVaultController";
import { VaultState } from "../generated/schema";
import {
    loadOrCreate as loadOrCreateUser,
    saveOrRemove as saveOrRemoveUser,
} from "./helpers/user";

export function handleBurn(event: Burn): void {
    const owner = loadOrCreateUser(event.params.owner);
    owner.osgnoShare = owner.osgnoShare.minus(event.params.shares);
    owner.osgnoAsset = owner.osgnoAsset.minus(event.params.assets);
    owner.voteWeight = owner.voteWeight.minus(event.params.assets);
    saveOrRemoveUser(owner);
}

export function handleMint(event: Mint): void {
    const receiver = loadOrCreateUser(event.params.receiver);
    receiver.osgnoShare = receiver.osgnoShare.plus(event.params.shares);
    receiver.osgnoAsset = receiver.osgnoAsset.plus(event.params.assets);
    receiver.voteWeight = receiver.voteWeight.plus(event.params.assets);
    saveOrRemoveUser(receiver);
}

export function handleStateUpdated(event: StateUpdated): void {
    let vaultState = VaultState.load("VAULT_STATE");
    if (vaultState == null) {
        vaultState = new VaultState("VAULT_STATE");
        vaultState.profitAccrued = BigInt.fromI32(0);
        vaultState.treasuryShare = BigInt.fromI32(0);
        vaultState.treasuryAsset = BigInt.fromI32(0);
        vaultState.rate = BigInt.fromI32(0);
        vaultState.lastUpdatedTimeStamp = BigInt.fromI32(0);
        vaultState.avgRewardPerSecond = BigInt.fromI32(0);
        vaultState.save();
    }
    vaultState.profitAccrued = event.params.profitAccrued;
    vaultState.treasuryShare = event.params.treasuryShares;
    vaultState.treasuryAsset = event.params.treasuryAssets;
    vaultState.lastUpdatedTimeStamp = event.block.timestamp
    vaultState.save();
}
