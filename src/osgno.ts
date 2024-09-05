import { Transfer } from "../generated-gc/ds-osgno/ERC20";
import {
  loadOrCreate as loadOrCreateUser,
  saveOrRemove as saveOrRemoveUser,
} from "./helpers/user";

import { ADDRESS_ZERO, OSGNO_MAX_FEE_PERCENT, WAD, ZERO_BI } from "./constants";
import { VaultState } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = loadOrCreateUser(from);
    const vaultState = VaultState.load("VAULT_STATE");
    userFrom.osgnoShare = userFrom.osgnoShare.minus(event.params.value);
    const newAsset =
      userFrom.voteWeight = userFrom.voteWeight.plus(userFrom.osgnoAsset);
    saveOrRemoveUser(userFrom);
  }

  if (to.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userTo = loadOrCreateUser(to);
    userTo.osgnoShare = userTo.osgnoShare.plus(event.params.value);
    userTo.voteWeight = userTo.voteWeight.plus(event.params.value);
    userTo.save();
  }
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