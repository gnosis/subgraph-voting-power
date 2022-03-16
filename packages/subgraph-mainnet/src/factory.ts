import { PoolCreated } from "../generated/Factory/Factory";
import { createAMMPair, GNO_ADDRESS } from "./helpers";

export function handlePoolCreated(event: PoolCreated): void {
  const isGnoTradingPair =
    event.params.token0.equals(GNO_ADDRESS) ||
    event.params.token1.equals(GNO_ADDRESS);

  if (isGnoTradingPair) {
    createAMMPair(event.params.pool, event.params.token0, event.params.token1);
    // log.info("Found GNO in POOL: {}", [event.params.pair.toHex()]);
  }
}
