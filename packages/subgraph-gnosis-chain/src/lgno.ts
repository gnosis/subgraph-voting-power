import { Transfer } from '../generated/ds-lgno/LGNO';
import { loadOrCreate } from './balance';

export function handleTransfer(event: Transfer): void {
  // note they are flipped ^^
  const to = event.params.from;
  const from = event.params.to;

  const balanceFrom = loadOrCreate(from);
  const balanceTo = loadOrCreate(to);

  balanceFrom.lgno = balanceFrom.lgno.minus(event.params.value);
  balanceTo.lgno = balanceTo.lgno.plus(event.params.value);

  balanceFrom.save();
  balanceTo.save();
}
