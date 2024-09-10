import { store, BigInt, log, Address } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../../generated/templates/BalancerV2Pool/ERC20";
import {
    loadOrCreate as loadOrCreateUser,
    saveOrRemove as saveOrRemoveUser,
} from "../helpers/user";

import {
    loadPool as loadWeightedPool,
    loadOrCreatePosition,
} from "../helpers/weightedPool";

import { ADDRESS_ZERO, arrayRemove } from "../constants";

export const COW_GNO_POOL_ADDRESS = Address.fromString(
    "0x92762b42a06dcdddc5b7362cfb01e631c4d44b40"
);
export const GNO_WETH_POOL_ADDRESS = Address.fromString(
    "0xf4c0dd9b82da36c07605df83c8a416f11724d88b"
);
export const COW_GNO_GAUGE_ADDRESS = Address.fromString(
    "0xa6468eca7633246dcb24e5599681767d27d1f978"
);
export const GNO_WETH_GAUGE_ADDRESS = Address.fromString(
    "0xcb664132622f29943f67fa56ccfd1e24cc8b4995"
);

// Staked LP token transfers are handled like actual LP token transfers, but without updates to the LP token total supply on burn and mint.
export function handleTransfer(event: TransferEvent): void {
    const from = event.params.from;
    const to = event.params.to;
    const value = event.params.value;

    let poolAddress: Address | null = null;
    if (event.address.equals(COW_GNO_GAUGE_ADDRESS)) {
        poolAddress = COW_GNO_POOL_ADDRESS;
    }
    if (event.address.equals(GNO_WETH_GAUGE_ADDRESS)) {
        poolAddress = GNO_WETH_POOL_ADDRESS;
    }

    if (!poolAddress) {
        throw new Error(
            `Could not find pool address for gauge ${event.address.toHexString()}`
        );
    }

    const pool = loadWeightedPool(poolAddress);

    const gnoReserves = pool.gnoBalance;
    log.info("pool loaded: {}, gno reserves: {}, total supply: {}", [
        pool.id,
        gnoReserves.toString(),
        pool.totalSupply.toString(),
    ]);

    const userTo = loadOrCreateUser(to);
    const userFrom = loadOrCreateUser(from);

    log.info("transfer staked Balancer LP token from: {}, to: {}, value: {}", [
        userFrom.id,
        userTo.id,
        value.toString(),
    ]);

    // transfer from
    if (
        from.toHexString() != ADDRESS_ZERO.toHexString() &&
        from.toHexString() != pool.id
    ) {
        const position = loadOrCreatePosition(pool, from);

        // decrease position liquidity and remove it if it gets to zero
        if (position.liquidity.minus(value) == BigInt.fromI32(0)) {
            store.remove("WeightedPoolPosition", position.id);
            pool.positions = arrayRemove(pool.positions, position.id);
            pool.save();
            log.info("removed from position {} of user {}", [
                position.id,
                userFrom.id,
            ]);
        } else {
            position.liquidity = position.liquidity.minus(value);
            position.save();
            log.info("adjusted from position {} of user {}, new liquidity: {}", [
                position.id,
                userFrom.id,
                position.liquidity.toString(),
            ]);
        }

        // decrease vote weight
        const voteWeightToSubtract = value.times(gnoReserves).div(pool.totalSupply);
        userFrom.voteWeight = userFrom.voteWeight.minus(voteWeightToSubtract);
        saveOrRemoveUser(userFrom);
        log.info("subtracted {} from vote weight of {}, for a new total of {}", [
            voteWeightToSubtract.toString(),
            userFrom.id,
            userFrom.voteWeight.toString(),
        ]);
    }

    // transfer to
    if (
        to.toHexString() != ADDRESS_ZERO.toHexString() &&
        to.toHexString() != pool.id
    ) {
        // increase position liquidity
        const position = loadOrCreatePosition(pool, to);
        position.liquidity = position.liquidity.plus(value);
        position.save();
        log.info("adjusted to position of user {}, new liquidity: {}", [
            userTo.id,
            position.liquidity.toString(),
        ]);

        // increase vote weight
        const voteWeightToAdd = value.times(gnoReserves).div(pool.totalSupply);
        userTo.voteWeight = userTo.voteWeight.plus(voteWeightToAdd);
        saveOrRemoveUser(userTo);
        log.info("added {} to vote weight of {}, for a new total of {}", [
            voteWeightToAdd.toString(),
            userTo.id,
            userTo.voteWeight.toString(),
        ]);
    }
}