import { effect, inject, Injectable, signal, untracked } from "@angular/core";
import { updatePreset } from "@primeng/themes";
import { AccountStore } from "../store/account.store";
export function generateColorScale(
    baseColor: string,
    steps: number = 11
): string[] {
    const { h, s, l } = hexToHsl(baseColor);

    const scale: string[] = [];

    // lightest → darkest
    const lightnessRange = {
        min: 15,   // darkest
        max: 95    // lightest
    };

    const stepSize = (lightnessRange.max - lightnessRange.min) / (steps - 1);

    for (let i = 0; i < steps; i++) {
        const newLightness = lightnessRange.max - i * stepSize;
        scale.push(hslToHex(h, s, newLightness));
    }

    return scale;
}
function hexToHsl(hex: string) {
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
}

function hslToHex(h: number, s: number, l: number) {
    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    const toHex = (x: number) =>
        Math.round(x * 255)
            .toString(16)
            .padStart(2, '0');

    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}


@Injectable({ providedIn: 'root' })
export class ThemeService {
    readonly isDark = signal<boolean>(false);
    private readonly faviconId = 'appFavicon';
    private readonly accountStore = inject(AccountStore);

    constructor() {
        this.ensureFaviconElement();
        const isPreferenceDark: boolean = !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (isPreferenceDark) {
            this.toggleDarkMode();
        }
        this.isDark.set(isPreferenceDark);


        effect(() => {
            const color = this.accountStore.me.hasValue() ? this.accountStore.me.value()?.color : null;
            untracked(() => {

                if (!color) { return; }
                const palette = generateColorScale(color);
                updatePreset({
                    semantic: {
                        primary: {
                            50: palette[0],
                            100: palette[1],
                            200: palette[2],
                            300: palette[3],
                            400: palette[4],
                            500: palette[5],
                            600: palette[6],
                            700: palette[7],
                            800: palette[8],
                            900: palette[9],
                            950: palette[10]
                        }
                    }
                });
            })

        })
    }

    toggleDarkMode(): void {
        const htmlElement = document.documentElement; // Gets the <html> tag
        htmlElement.classList.toggle('p-dark');
        this.isDark.set(this.isDarkMode());
        this.setFavicon();
    }

    private ensureFaviconElement() {
        let link: HTMLLinkElement | null = document.querySelector(`#${this.faviconId}`);
        if (!link) {
            link = document.createElement('link');
            link.id = this.faviconId;
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        this.setFavicon();
    }


    private setFavicon() {
        const iconUrl = `${this.isDark() ? 'favicon-dark.ico' : 'favicon.ico'}`;
        const link: HTMLLinkElement | null = document.querySelector(`#${this.faviconId}`);
        if (link) {
            link.href = iconUrl;
        }
    }

    private isDarkMode(): boolean {
        return document.documentElement.classList.contains('p-dark');
    }
}