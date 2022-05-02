import { Transfer as TransferEvent } from "../../generated/templates/BalancerV2Pool/ERC20";
import { weightedPoolTransfer } from "../helpers";

export function handleTransfer(event: TransferEvent): void {
  const id = event.address.toHexString();
  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;

  weightedPoolTransfer(event, id, from, to, value);
}
