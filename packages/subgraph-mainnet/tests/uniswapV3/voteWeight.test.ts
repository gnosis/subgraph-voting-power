import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as";
import { ConcentratedLiquidityPosition } from "../../../subgraph-base/generated/schema";
import { getToken0Balance } from "../../src/uniswapV3/voteWeight";

test("correctly calculates balances of first token", () => {
  const position = new ConcentratedLiquidityPosition("218573");
  position.liquidity = BigInt.fromString("62899636745155889642835");
  position.lowerTick = BigInt.fromString("-22080");
  position.upperTick = BigInt.fromString("-13920");
  const result = getToken0Balance(
    position,
    BigDecimal.fromString("0.3341933625038068863626110801625951")
  );
  assert.bigIntEquals(BigInt.fromString("62059024890327950407709"), result);
});
