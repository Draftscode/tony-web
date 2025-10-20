import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, input, OnInit, signal, viewChild } from "@angular/core";
import { outputFromObservable, toObservable } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-signature-pad',
    templateUrl: 'signature-pad.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
        styles: `
    :host {
        cursor: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAtOTYwIDk2MCA5NjAiIHdpZHRoPSIyNHB4IiBmaWxsPSIjZTNlM2UzIj48cGF0aCBkPSJtNDkwLTUyNyAzNyAzNyAyMTctMjE3LTM3LTM3LTIxNyAyMTdaTTIwMC0yMDBoMzdsMjMzLTIzMy0zNy0zNy0yMzMgMjMzdjM3Wm0zNTUtMjA1TDQwNS01NTVsMTY3LTE2Ny0yOS0yOS0yMTkgMjE5LTU2LTU2IDIxOC0yMTlxMjQtMjQgNTYuNS0yNHQ1Ni41IDI0bDI5IDI5IDUwLTUwcTEyLTEyIDI4LjUtMTJ0MjguNSAxMmw5MyA5M3ExMiAxMiAxMiAyOC41VDgyOC02NzhMNTU1LTQwNVpNMjcwLTEyMEgxMjB2LTE1MGwyODUtMjg1IDE1MCAxNTAtMjg1IDI4NVoiLz48L3N2Zz4=') 0 16, auto;
    }`
})
export class SignaturePadComponent implements OnInit {
    name = input<string>();
    sigPad = viewChild<ElementRef>('sigPad');
    sigPadElement = computed(() => this.sigPad()?.nativeElement);

    context = computed(() => {
        const ctx = this.sigPadElement()?.getContext('2d');
        if (!ctx) { return null; }
        ctx.strokeStyle = '#3742fa';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1a237e';
        ctx.lineWidth = 1.5;
        return ctx;
    });
    isDrawing = signal<boolean>(false);
    img = computed(() => {
        if (!this.isDrawing()) {
            return this.sigPadElement()?.toDataURL('image/png') as string ?? null;
        }
        return null;
    });
    imageChange$ = toObservable(this.img);
    onChange = outputFromObservable(this.imageChange$);

    lastTime = 0;
    lastPos: { x: number; y: number } | null = null;

    constructor() {
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    ngOnInit(): void {
        this.resizeCanvas();
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(e: MouseEvent) {
        this.isDrawing.set(false);
        this.context()?.beginPath();
    }

    /** Resize canvas to match container size + device pixel ratio */
    resizeCanvas() {
        const canvas = this.sigPadElement();
        const ctx = this.context();
        if (!canvas || !ctx) return;

        // Save existing image (optional)
        const prevImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Adjust internal resolution
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Scale context so 1 unit = 1 CSS pixel
        ctx.scale(dpr, dpr);

        // Restore saved image (optional)
        ctx.putImageData(prevImage, 0, 0);
    }

    onMouseDown(e: MouseEvent) {
        this.isDrawing.set(true);
        this.lastPos = this.relativeCoords(e);
        this.lastTime = Date.now();
    }

    onMouseMove(e: MouseEvent) {
        if (!this.isDrawing()) return;

        const newPos = this.relativeCoords(e);
        const newTime = Date.now();

        // Velocity = distance / time
        const dx = newPos.x - (this.lastPos?.x ?? newPos.x);
        const dy = newPos.y - (this.lastPos?.y ?? newPos.y);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const time = newTime - this.lastTime || 1;
        const velocity = distance / time;

        // Adjust line width based on speed (slower = thicker)
        const newWidth = Math.max(0.8, 3.5 - velocity * 3);
        const ctx = this.context();
        if (!ctx) return;

        ctx.lineWidth = ctx.lineWidth * 0.7 + newWidth * 0.3; // smooth transitions
        ctx.beginPath();
        ctx.moveTo(this.lastPos?.x ?? newPos.x, this.lastPos?.y ?? newPos.y);
        ctx.lineTo(newPos.x, newPos.y);
        ctx.stroke();

        this.lastPos = newPos;
        this.lastTime = newTime;
    }

    private relativeCoords(event: any) {
        const bounds = (event.target as HTMLElement).getBoundingClientRect();
        return {
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
        };
    }

    clear() {
        const el = this.sigPadElement();
        const ctx = this.context();
        if (ctx && el) {
            ctx.clearRect(0, 0, el.width, el.height);
            ctx.beginPath();
        }
    }
}