import { AvgRewardPerSecondUpdated, Burn, FeePercentUpdated, Mint, StateUpdated } from "../generated-gc/ds-osgno-vault/OsTokenVaultController";
import {
    loadOrCreate as loadOrCreateUser,
    saveOrRemove as saveOrRemoveUser,
} from "./helpers/user";
import { loadOrCreateVault } from "./helpers/osgnoVault";

// HANDLE FOR OSGNO VAULT, NEED FURTHER TESTS
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
    let vaultState = loadOrCreateVault();

    const profitAccrued = event.params.profitAccrued;
    const treasuryShares = event.params.treasuryShares;

    const newTotalAssets = vaultState._totalAssets.plus(profitAccrued);

    vaultState.profitAccrued = profitAccrued;
    vaultState._totalAssets = newTotalAssets;
    vaultState._totalShares = vaultState._totalShares.plus(treasuryShares);
    vaultState.lastUpdatedTimeStamp = event.block.timestamp;

    vaultState.save();
}


export function handleAvgRewardPerSecondUpdated(event: AvgRewardPerSecondUpdated): void {
    let vaultState = loadOrCreateVault();
    vaultState.avgRewardPerSecond = event.params.avgRewardPerSecond;
    vaultState.save();
}

export function handleFeePercentUpdated(event: FeePercentUpdated): void {
    let vaultState = loadOrCreateVault();
    vaultState.feePercent = event.params.feePercent;
    vaultState.save();
}
