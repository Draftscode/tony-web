import { Directive, ElementRef, HostListener, inject, input, Input } from '@angular/core';

@Directive({
    selector: 'img[fallback]',
})
export class FallbackImageDirective {
    fallback = input<string>('');

    private readonly el = inject(ElementRef);

    @HostListener('error')
    onError() {
        const element = this.el.nativeElement as HTMLImageElement;
        if (this.fallback() && element.src !== this.fallback()) {
            element.src = this.fallback();
        }
    }
}