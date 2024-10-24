import { Transfer } from "../generated/ds-gno/ERC20";
import {
  loadOrCreate as loadOrCreateUser,
  saveOrRemove as saveOrRemoveUser,
} from "./helpers/user";

import { ADDRESS_ZERO, DEPOSIT_ADDRESS, ZERO_BI } from "./constants";

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  if (from.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userFrom = loadOrCreateUser(from);
    userFrom.gno = userFrom.gno.minus(event.params.value);
    userFrom.voteWeight = userFrom.voteWeight.minus(event.params.value);
    saveOrRemoveUser(userFrom);
  }

  // HANDLE FOR DEPOSIT WITHDRAWAL CLAIM
  // Decreasing deposit balance to prevent untracked withdrawal from deposit contract
  // Temporary solution as this approach does not fully accounting for rewards generated by the validator
  if (from.toHexString() == DEPOSIT_ADDRESS.toHexString()) {
    const userTo = loadOrCreateUser(to);

    if (userTo.deposit > ZERO_BI) {
      // To avoid a negative result that could throw an error
      if (userTo.deposit <= event.params.value) {
        userTo.voteWeight = userTo.voteWeight.minus(userTo.deposit);
        userTo.voteWeight = userTo.voteWeight.plus(event.params.value);
        userTo.deposit = ZERO_BI;
      } else {
        userTo.voteWeight = userTo.voteWeight.minus(event.params.value);
        userTo.deposit = userTo.deposit.minus(event.params.value);
      }
      userTo.gno = userTo.gno.plus(event.params.value);
      saveOrRemoveUser(userTo);
    }
  }

  if (to.toHexString() != ADDRESS_ZERO.toHexString()) {
    const userTo = loadOrCreateUser(to);
    userTo.gno = userTo.gno.plus(event.params.value);
    userTo.voteWeight = userTo.voteWeight.plus(event.params.value);
    userTo.save();
  }
}
