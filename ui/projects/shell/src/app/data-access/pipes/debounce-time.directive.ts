// debounce-input.directive.ts
import { Directive, HostListener, input } from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
    selector: '[debounceTime]'
})
export class DebounceInputDirective {
    debounceTime = input<number>(300); // default debounce in ms
    private readonly inputSubject = new Subject<string>();

    debounce = outputFromObservable(this.inputSubject.pipe(debounceTime(this.debounceTime())));

    @HostListener('input', ['$event'])
    onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        this.inputSubject.next(target.value);
    }
}