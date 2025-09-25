import { EmptyFeatureResult, SignalStoreFeature, signalStoreFeature, SignalStoreFeatureResult, StateSignals, StateSource, withProps } from "@ngrx/signals";

export function withResources<
  Input extends SignalStoreFeatureResult,
  Result extends Record<string, unknown>,
>(
  resourcesFactory: (
    store: Input['props'] & Input['methods'] & StateSignals<Input['state']> & StateSource<Input['state']>,
  ) => Result,
): SignalStoreFeature<
  Input,
  EmptyFeatureResult & { props: Result }
> {
  return (store) => {
    const source = store as StateSource<typeof store.stateSignals>;

    const resources = resourcesFactory({
      ...source,
      ...store.props,
      ...store.methods,
      ...store.stateSignals,
    });

    const feature = signalStoreFeature(
      withProps(() => resources),
    );

    return feature(store);
  };
}
