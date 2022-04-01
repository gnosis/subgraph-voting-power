export function handleNewWeightedPool(event: PoolCreated): void {
  createWeightedLikePool(event, PoolType.Weighted);
  WeightedPoolTemplate.create(event.params.pool);
}
