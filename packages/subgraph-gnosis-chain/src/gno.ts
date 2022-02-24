import { Transfer } from '../generated/ds-gno/GNO';
import { loadOrCreate } from './balance';

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  const balanceFrom = loadOrCreate(from);
  const balanceTo = loadOrCreate(to);

  balanceFrom.gno = balanceFrom.gno.minus(event.params.value);
  balanceTo.gno = balanceTo.gno.plus(event.params.value);

  balanceFrom.save();
  balanceTo.save();
}
