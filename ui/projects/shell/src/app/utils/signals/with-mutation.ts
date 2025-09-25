import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { EmptyFeatureResult, SignalStoreFeature, signalStoreFeature, SignalStoreFeatureResult, StateSource, withMethods } from "@ngrx/signals";
import { lastValueFrom } from "rxjs";

export enum HttpMutationOperator {
    concat = 'concat',
    merge = 'merge',
}
export type CreateHttpMutationArgs<TInput, TOutput> = {
    onSuccess: (response: TOutput) => void;
    onError: (error: unknown) => void;
    request: (flightDto: TInput) => Partial<{ url: string; body: TInput; method: string; }>;
    operator: HttpMutationOperator,
};


export function createHttpMutation<TInput, TOutput>(options: Partial<CreateHttpMutationArgs<TInput, TOutput>>) {
    const http = inject(HttpClient);
    return async (dto: TInput) => {
        if (!options.request) {
            throw Error('request is required');
        }
        const req = options.request(dto);

        try {
            const result = await lastValueFrom(
                http.request<TOutput>(req.method!, req.url!, {
                    body: req.body,
                }),
            );

            if (options.onSuccess) {
                options.onSuccess(result);
            }
        } catch (e) {
            if (options.onError) {
                options.onError(e);
            }
        }
    }
}

type Mutation<TInput> = (dto: TInput) => void;

type MutationsDictionary = Record<string, Mutation<any>>;

type NamedMutationMethods<T extends MutationsDictionary> = {
    [Prop in keyof T as `${Prop & string}`]: T[Prop] extends Mutation<infer P>
    ? Mutation<P>
    : never;
};

export function withMutations<
    Input extends SignalStoreFeatureResult,
    Result extends MutationsDictionary,
>(
    mutationsFactory: (
        store: Input['props'] & Input['methods'] & StateSource<Input['state']>,
    ) => Result,
): SignalStoreFeature<
    Input,
    EmptyFeatureResult & { methods: NamedMutationMethods<Result> }
> {
    return (store) => {
        const source = store as StateSource<typeof store.stateSignals>;
        const mutations = mutationsFactory({
            ...source,
            ...store.props,
            ...store.methods,
            ...store.stateSignals,
        });

        const feature = signalStoreFeature(
            withMethods(() => mutations as unknown as NamedMutationMethods<Result>)
        );

        return feature(store);
    };
}
