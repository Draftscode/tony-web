import { computed, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRouteSnapshot, MaybeAsync, NavigationEnd, Router, RouterStateSnapshot } from "@angular/router";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { MenuItem } from "primeng/api";
import { filter, Observable, Subscription, take } from "rxjs";
import { uuidv4 } from "../../utils/uuid";

export const BreadcrumbStore = signalStore(
    { providedIn: 'root' },
    withState({
        home: { icon: 'pi pi-home', routerLink: '/' } as MenuItem | undefined,
        breadcrumbs: [] as ItemType[]
    }),
    withMethods(store => {
        const add = (id: string, item: ItemType) => {
            item.id = id;

            patchState(store, store => {
                const items = store.breadcrumbs;
                const index = items.findIndex(i => i.id === id)
                if (index !== -1) {
                    items[index] = item;
                } else {
                    items.push(item);
                }

                return { breadcrumbs: [...items].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)) };
            })
        }

        const remove = (id: string) => {
            patchState(store, store => ({ breadcrumbs: store.breadcrumbs.filter(i => i.id !== id) }))
        }

        return { add, remove };
    }),
    withComputed(({ breadcrumbs }) => ({
        pruned: computed(() => {
            const pruned = breadcrumbs()?.filter(b => b.visible !== false);
            return pruned.length ? pruned : [];
        }),
    })),
);

type ItemType = BaseItem & { index?: number; skipTranslation?: boolean };
type BreadcrumbFactoryType<T> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => MaybeAsync<T>;
type BaseItem = MenuItem & { skipTranslation?: boolean; };
export type BreadcrumbType = BaseItem | BreadcrumbFactoryType<BaseItem>;



export const resolveBreadcrumb = (dto: BreadcrumbType) => {
    return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<boolean> => {
        const id = uuidv4();
        const _router = inject(Router);
        const api = inject(BreadcrumbStore);

        const link = `/${buildLink(route).join('/')}`;
        const index = getIndex(route);

        const subscriptions: Subscription[] = [];

        _router.events.pipe(
            takeUntilDestroyed(),
            filter((e) => {
                if (!(e instanceof NavigationEnd)) { return false; }

                const url = e.urlAfterRedirects ?? e.url;

                return !isSegmentedSubpath(link, url);
            }),
            take(1),
        ).subscribe((e) => {
            api.remove(id);
            // remove old subscriptions
            subscriptions?.forEach(s => s.unsubscribe());
        });

        const addItem = (item: MenuItem) => {
            if (!item) { return; }

            // adds the possibility for relative routing if routerLink was already set
            item.routerLink = item.routerLink?.length === 0 ? [] : item.routerLink?.length > 0 ? item.routerLink : (item.target ? [link, ...item.target] : [link]);
            item['index'] = index;
            api.add(id, item);
        };

        if (dto instanceof Function) {
            const obj = dto(route, state);
            if (obj instanceof Observable) {
                subscriptions.push(obj.subscribe((item) => addItem(item)));
            } else if (obj instanceof Promise) {
                obj.then((item) => addItem(item));
            } else {
                addItem(obj);
            }
        } else {
            addItem(dto);
        }

        return true;
    }
}

const getIndex = (route: ActivatedRouteSnapshot) => {
    let count = 0;
    while (route.parent) {
        route = route.parent;
        count++;
    }

    return count;
}

const buildLink = (route: ActivatedRouteSnapshot): string[] => {
    const chunk: string = route.routeConfig?.path?.split('/')
        .map(item => {
            if (item.startsWith(':')) {
                return route.params[item.substring(1, item.length)];
            }
            return item;
        })
        .join('/')!;

    if (route.parent) {
        return [...buildLink(route.parent), chunk].filter(i => i !== '');
    }

    return [] as string[];
}

function isSegmentedSubpath(subPath: string, fullPath: string): boolean {
    const [fullPathWithoutQuery, fullQuery = ''] = fullPath.split('?');
    const [subPathWithoutQuery, subQuery = ''] = subPath.split('?');

    const fullSegments = fullPathWithoutQuery.split('/').filter(Boolean);
    const subSegments = subPathWithoutQuery.split('/').filter(Boolean);

    // Match path segments
    let matched = false;
    for (let i = 0; i <= fullSegments.length - subSegments.length; i++) {
        let match = true;

        for (let j = 0; j < subSegments.length; j++) {
            if (fullSegments[i + j] !== subSegments[j]) {
                match = false;
                break;
            }
        }

        if (match) {
            matched = true;
            break;
        }
    }

    if (!matched) return false;

    // Match query params (all sub must exist in full)
    const fullQueryParams = new URLSearchParams(fullQuery);
    const subQueryParams = new URLSearchParams(subQuery);

    let queryMatch = true;
    subQueryParams.forEach((value, key) => {
        if (fullQueryParams.get(key) !== value) {
            queryMatch = false;
        }
    });

    return queryMatch;
}
