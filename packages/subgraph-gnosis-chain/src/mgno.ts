import { Transfer } from '../generated/ds-mgno/MGNO';
import { loadOrCreate } from './balance';

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;
  const value = event.params.value;

  const balanceFrom = loadOrCreate(from);
  const balanceTo = loadOrCreate(to);

  balanceFrom.mgno = balanceFrom.mgno.minus(event.params.value);
  balanceTo.mgno = balanceTo.mgno.plus(event.params.value);

  balanceFrom.save();
  balanceTo.save();
}
