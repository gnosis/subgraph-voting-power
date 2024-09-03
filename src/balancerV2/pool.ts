import { Transfer as TransferEvent } from "../../generated/templates/BalancerV2Pool/ERC20";

import { handleTransfer as handleTransferForWeightedPool } from "../helpers/weightedPool";

export function handleTransfer(event: TransferEvent): void {
    const from = event.params.from;
    const to = event.params.to;
    const value = event.params.value;

    handleTransferForWeightedPool(event, from, to, value);
}