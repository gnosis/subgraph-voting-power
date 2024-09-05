import { Transfer } from "../generated-gc/ds-osgno/ERC20";
import {
  loadOrCreate as loadOrCreateUser,
  saveOrRemove as saveOrRemoveUser,
} from "./helpers/user";

import { ADDRESS_ZERO, OSGNO_MAX_FEE_PERCENT, WAD, ZERO_BI } from "./constants";
import { VaultState } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { loadOrCreateVault } from "./helpers/osgnoVault";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = loadOrCreateUser(from);
    userFrom.osgnoShare = userFrom.osgnoShare.minus(event.params.value);
    const newAsset = convertToAssets(userFrom.osgnoShare, event.block.timestamp);
    userFrom.voteWeight = userFrom.voteWeight.plus(userFrom.osgnoAsset);
    userFrom.osgnoAsset = newAsset;
    userFrom.voteWeight = userFrom.voteWeight.minus(userFrom.osgnoAsset);
    saveOrRemoveUser(userFrom);
  }

  if (to.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userTo = loadOrCreateUser(to);
    userTo.osgnoShare = userTo.osgnoShare.plus(event.params.value);
    const newAsset = convertToAssets(userTo.osgnoShare, event.block.timestamp);
    userTo.voteWeight = userTo.voteWeight.minus(userTo.osgnoAsset);
    userTo.osgnoAsset = newAsset;
    userTo.voteWeight = userTo.voteWeight.plus(userTo.osgnoAsset);
    userTo.save();
  }
}

function convertToAssets(shares: BigInt, timestamp: BigInt) {
  const vaultState = loadOrCreateVault();
  const _totalShares = vaultState.treasuryShare;
  return _convertToAssets(shares, _totalShares, totalAssets(timestamp, vaultState.lastUpdatedTimeStamp, vaultState.avgRewardPerSecond, vaultState.treasuryAsset, vaultState.feePercent));
}

function _convertToAssets(shares: BigInt, totalShares_: BigInt, totalAssets_: BigInt) {
  return (totalShares_ == ZERO_BI) ? shares : shares.times(totalAssets_).div(totalShares_);
}

function totalAssets(timestamp: BigInt, _lastUpdateTimestamp: BigInt, avgRewardPerSecond: BigInt, _totalAssets: BigInt, feePercent: BigInt) {
  let profitAccrued = _unclaimedAssets(timestamp, _lastUpdateTimestamp, avgRewardPerSecond, _totalAssets);
  if (profitAccrued == ZERO_BI) return _totalAssets;

  let treasuryAssets = profitAccrued.times(feePercent).div(OSGNO_MAX_FEE_PERCENT);
  return _totalAssets.plus(profitAccrued).minus(treasuryAssets);
}


function _unclaimedAssets(timestamp: BigInt, _lastUpdateTimestamp: BigInt, avgRewardPerSecond: BigInt, _totalAssets: BigInt) {
  // calculate time passed since the last update
  // cannot realistically underflow
  let timeElapsed = timestamp.minus(_lastUpdateTimestamp);

  if (timeElapsed == ZERO_BI) return ZERO_BI;
  let reward = avgRewardPerSecond.times(_totalAssets).times(timeElapsed);
  return reward.div(WAD);
}