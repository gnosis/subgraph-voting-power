import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import {
  User,
  WeightedPool,
  WeightedPoolPosition,
} from "../../../subgraph-base/generated/schema";
import {
  GNO_ADDRESS,
  loadOrCreateUser,
  removeOrSaveUser,
  ZERO_BI,
} from "../../../subgraph-base/src/helpers";
import {
  InternalBalanceChanged,
  Swap as SwapEvent,
} from "../../generated/Vault/Vault";

export function handleSwap(event: SwapEvent): void {
  const pool = loadWeightedPool(event.address);

  // swaps don't change LP token total supply, but they might change the GNO reserves
  const gnoIn = event.params.tokenIn.equals(GNO_ADDRESS)
    ? event.params.amountIn
    : ZERO_BI;
  const gnoOut = event.params.tokenOut.equals(GNO_ADDRESS)
    ? event.params.amountIn
    : ZERO_BI;

  if (gnoIn.equals(ZERO_BI) && gnoOut.equals(ZERO_BI)) {
    // no change in GNO reserves
    return;
  }

  // Swap() is emitted after Transfer(), so reading the pool's balance will give us the updated value
  const gnoReserves = loadGnoReserves(pool.id);
  // to get the GNO reserves before the swap, we add the amount delta
  const gnoReservesBefore = gnoReserves.minus(gnoIn).plus(gnoOut);

  log.info("handle swap in {}, gno reserves before: {}, after: {}", [
    pool.id,
    gnoReservesBefore.toString(),
    gnoReserves.toString(),
  ]);

  if (pool.positions) {
    for (let index = 0; index < pool.positions.length; index++) {
      const position = WeightedPoolPosition.load(pool.positions[index]);
      if (position) {
        const user = loadOrCreateUser(Address.fromString(position.user));

        const voteWeightToSubtract = position.liquidity
          .times(gnoReservesBefore)
          .div(pool.totalSupply);
        const voteWeightToAdd = position.liquidity
          .times(gnoReserves)
          .div(pool.totalSupply);
        user.voteWeight = user.voteWeight
          .plus(voteWeightToAdd)
          .minus(voteWeightToSubtract);
        user.save();

        log.info(
          "updated vote weight of user {} with liquidity {} (-{}, +{})",
          [
            user.id,
            position.liquidity.toString(),
            voteWeightToSubtract.toString(),
            voteWeightToAdd.toString(),
          ]
        );
      }
    }
  }
}

export function handleInternalBalanceChange(
  event: InternalBalanceChanged
): void {
  if (event.params.token.equals(GNO_ADDRESS)) {
    const user = loadOrCreateUser(event.params.user);
    user.balancerInternalGno = user.balancerInternalGno.plus(
      event.params.delta
    );
    user.voteWeight = user.voteWeight.plus(event.params.delta);
    removeOrSaveUser(user);
  }
}

function loadWeightedPool(address: Address): WeightedPool {
  const id = address.toHexString();
  const pool = WeightedPool.load(id);
  if (!pool) throw new Error(`WeightedPool with id ${id} not found`);
  return pool;
}

function loadGnoReserves(accountAddress: string): BigInt {
  const user = User.load(accountAddress);
  if (!user) return ZERO_BI;
  return user.gno;
}
