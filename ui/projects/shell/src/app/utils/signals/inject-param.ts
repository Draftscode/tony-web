import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export function injectParam(key: string): string | null {
    const route = inject(ActivatedRoute);

    let current: ActivatedRoute | null = route;

    while (current) {
        const paramValue = current.snapshot.paramMap.get(key);
        if (paramValue !== null) {
            return paramValue;
        }
        current = current.parent;
    }

    return null;
}