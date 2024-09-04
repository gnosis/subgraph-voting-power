import { Burn, Mint } from "../generated-gc/ds-osgno-vault/OsTokenVaultController";
import {
    loadOrCreate as loadOrCreateUser,
    saveOrRemove as saveOrRemoveUser,
} from "./helpers/user";

export function handleBurn(event: Burn): void {
    const owner = loadOrCreateUser(event.params.owner);
    owner.osgno = owner.osgno.minus(event.params.shares);
    // owner.voteWeight = owner.voteWeight.minus(event.params.assets);
    saveOrRemoveUser(owner);
}

export function handleMint(event: Mint): void {
    const receiver = loadOrCreateUser(event.params.receiver);
    receiver.osgno = receiver.osgno.plus(event.params.shares);
    // receiver.voteWeight = receiver.voteWeight.plus(event.params.assets);
    saveOrRemoveUser(receiver);
}
