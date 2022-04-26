import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { assert, test } from "matchstick-as";
import { ConcentratedLiquidityPosition } from "../../../subgraph-base/generated/schema";
import {
  getToken0Balance,
  getToken1Balance,
} from "../../src/uniswapV3/voteWeight";

test("correctly calculates balances of first token when price is in the range", () => {
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

test("it correctly calculates first token balance when price is lower than the range", () => {
  const position = new ConcentratedLiquidityPosition("218573");
  position.liquidity = BigInt.fromString("62899636745155889642835");
  position.lowerTick = BigInt.fromString("-22080");
  position.upperTick = BigInt.fromString("-13920");
  const result = getToken0Balance(position, BigDecimal.fromString("0.1"));
  assert.bigIntEquals(BigInt.fromString("63553559125093023476285"), result);
});

test("it correctly calculates first token balance when price is higher than the range", () => {
  const position = new ConcentratedLiquidityPosition("218573");
  position.liquidity = BigInt.fromString("62899636745155889642835");
  position.lowerTick = BigInt.fromString("-22080");
  position.upperTick = BigInt.fromString("-13920");
  const result = getToken0Balance(position, BigDecimal.fromString("0.6"));
  assert.bigIntEquals(BigInt.fromString("0"), result);
});

test("correctly calculates balances of second token when price is within bounds", () => {
  const position = new ConcentratedLiquidityPosition("218573");
  position.liquidity = BigInt.fromString("62899636745155889642835");
  position.lowerTick = BigInt.fromString("-22080");
  position.upperTick = BigInt.fromString("-13920");
  const result = getToken1Balance(
    position,
    BigDecimal.fromString("0.3341933625038068863626110801625951")
  );
  assert.bigIntEquals(BigInt.fromString("165602371265231992269"), result);
});

test("it correctly calculates second token balance when price is lower than the range", () => {
  const position = new ConcentratedLiquidityPosition("218573");
  position.liquidity = BigInt.fromString("62899636745155889642835");
  position.lowerTick = BigInt.fromString("-22080");
  position.upperTick = BigInt.fromString("-13920");
  const result = getToken1Balance(position, BigDecimal.fromString("0.1"));
  assert.bigIntEquals(BigInt.fromString("0"), result);
});

test("it correctly calculates second token balance when price is higher than the range", () => {
  const position = new ConcentratedLiquidityPosition("218573");
  position.liquidity = BigInt.fromString("62899636745155889642835");
  position.lowerTick = BigInt.fromString("-22080");
  position.upperTick = BigInt.fromString("-13920");
  const result = getToken1Balance(position, BigDecimal.fromString("0.6"));
  assert.bigIntEquals(BigInt.fromString("10506278125357606316290"), result);
});
