import { Transfer } from '../generated/ds-lgno/LGNO';
import { loadOrCreateUser } from './helpers';

export function handleTransfer(event: Transfer): void {
  // note they are flipped ^^
  const to = event.params.from;
  const from = event.params.to;

  const userFrom = loadOrCreateUser(from);
  const userTo = loadOrCreateUser(to);

  userFrom.lgno = userFrom.lgno.minus(event.params.value);
  userTo.lgno = userTo.lgno.plus(event.params.value);

  userFrom.save();
  userTo.save();
}
