import { Transfer } from '../generated/ds-gno/GNO';
import { loadOrCreateUser } from './helpers';

export function handleTransfer(event: Transfer): void {
  const to = event.params.to;
  const from = event.params.from;

  const userFrom = loadOrCreateUser(from);
  const userTo = loadOrCreateUser(to);

  userFrom.gno = userFrom.gno.minus(event.params.value);
  userTo.gno = userTo.gno.plus(event.params.value);

  userFrom.save();
  userTo.save();
}
