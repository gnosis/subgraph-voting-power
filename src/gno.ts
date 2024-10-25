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

  // Event handler for processing exits and claims from the Gnosis Beacon Chain Deposit contract.
  // This function decreases the user's deposit balance and voting power whenever an exit or reward claim occurs.
  // Important: Currently, exits and reward claims emit identical events, and trigger both balance reductions.
  // Future improvements should distinguish between exits (reducing both deposit and voting power)
  // and reward claims (adjusting only the voting power).
  if (from.toHexString() == DEPOSIT_ADDRESS.toHexString()) {
    const userTo = loadOrCreateUser(to);

    if (userTo.deposit > ZERO_BI) {
      if (userTo.deposit <= event.params.value) {
        userTo.voteWeight = userTo.voteWeight.minus(userTo.deposit);
        userTo.deposit = ZERO_BI;
      } else {
        userTo.voteWeight = userTo.voteWeight.minus(event.params.value);
        userTo.deposit = userTo.deposit.minus(event.params.value);
      }
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