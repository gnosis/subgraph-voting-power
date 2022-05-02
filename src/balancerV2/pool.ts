import { Transfer as TransferEvent } from "../../generated/templates/BalancerV2Pool/ERC20";
import { weightedPoolTransfer } from "../helpers";

export function handleTransfer(event: TransferEvent): void {
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;

  weightedPoolTransfer(event, from, to, value);
}
