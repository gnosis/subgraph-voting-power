import { clearStore, test, assert } from "matchstick-as/assembly/index";
import { USER1_ADDRESS, value, PAIR_ADDRESS, value2x } from "../helpers";
import { handleNewPair } from "../../src/uniswapV2/factory";
import { createPairCreatedEvent } from "../helpers";
import { GNO_ADDRESS } from "../../src/helpers";

test("Factory spawns pair", () => {
  clearStore();
  const otherToken = USER1_ADDRESS;
  const pairCreatedEvent = createPairCreatedEvent(
    GNO_ADDRESS,
    otherToken,
    PAIR_ADDRESS,
    value
  );
  handleNewPair(pairCreatedEvent);
  assert.fieldEquals(
    "WeightedPool",
    PAIR_ADDRESS.toHexString(),
    "id",
    PAIR_ADDRESS.toHexString()
  );
});

test("New pair has correct GNO position", () => {
  clearStore();
  const otherToken = USER1_ADDRESS;
  handleNewPair(
    createPairCreatedEvent(GNO_ADDRESS, otherToken, PAIR_ADDRESS, value)
  );
  assert.fieldEquals(
    "WeightedPool",
    PAIR_ADDRESS.toHexString(),
    "gnoIsFirst",
    "true"
  );

  clearStore();
  handleNewPair(
    createPairCreatedEvent(otherToken, GNO_ADDRESS, PAIR_ADDRESS, value)
  );
  assert.fieldEquals(
    "WeightedPool",
    PAIR_ADDRESS.toHexString(),
    "gnoIsFirst",
    "false"
  );
});
