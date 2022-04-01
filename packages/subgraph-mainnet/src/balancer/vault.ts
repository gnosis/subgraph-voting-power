export function handleSwap(event: SwapEvent): void {
  const pool = loadWeightedPool(event.address);

  // swaps don't change LP token total supply, but they do change the GNO reserves and thus the ratio
  const gnoIn = pool.gnoIsFirst
    ? event.params.amount0In
    : event.params.amount1In;
  const gnoOut = pool.gnoIsFirst
    ? event.params.amount0Out
    : event.params.amount1Out;

  // Swap() is emitted after Transfer(), so reading the pool's balance will give us the updated value
  const gnoReserves = loadGnoReserves(pool.id);
  // to get the GNO reserves before the swap, we add the amount delta
  const gnoReservesBefore = gnoReserves.minus(gnoIn).plus(gnoOut);

  log.info("handle swap in {}, gno reserves before: {}, after: {}", [
    pool.id,
    gnoReservesBefore.toString(),
    gnoReserves.toString(),
  ]);

  if (pool.positions) {
    for (let index = 0; index < pool.positions.length; index++) {
      const position = WeightedPoolPosition.load(pool.positions[index]);
      if (position) {
        const user = loadOrCreateUser(Address.fromString(position.user));

        const voteWeightToSubtract = position.liquidity
          .times(gnoReservesBefore)
          .div(pool.totalSupply);
        const voteWeightToAdd = position.liquidity
          .times(gnoReserves)
          .div(pool.totalSupply);
        user.voteWeight = user.voteWeight
          .plus(voteWeightToAdd)
          .minus(voteWeightToSubtract);
        user.save();

        log.info(
          "updated vote weight of user {} with liquidity {} (-{}, +{})",
          [
            user.id,
            position.liquidity.toString(),
            voteWeightToSubtract.toString(),
            voteWeightToAdd.toString(),
          ]
        );
      }
    }
  }
}

// account for Balancer internal GNO balances -> add field to user: balancerInternalGno
// export function handleInternalBalanceChange(event: InternalBalanceChanged): void {
//     createUserEntity(event.params.user);

//     let userAddress = event.params.user.toHexString();
//     let token = event.params.token;
//     let balanceId = userAddress.concat(token.toHexString());

//     let userBalance = UserInternalBalance.load(balanceId);
//     if (userBalance == null) {
//       userBalance = new UserInternalBalance(balanceId);

//       userBalance.userAddress = userAddress;
//       userBalance.token = token;
//       userBalance.balance = ZERO_BD;
//     }

//     let transferAmount = tokenToDecimal(event.params.delta, getTokenDecimals(token));
//     userBalance.balance = userBalance.balance.plus(transferAmount);

//     userBalance.save();
//   }
