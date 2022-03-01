import { Transfer } from '../generated/ds-mgno/MGNO';
import { loadOrCreateUser } from './helpers';

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;
  const value = event.params.value;

  const userFrom = loadOrCreateUser(from);
  const userTo = loadOrCreateUser(to);

  userFrom.mgno = userFrom.mgno.minus(value);
  userTo.mgno = userTo.mgno.plus(value);

  userFrom.save();
  userTo.save();
}
