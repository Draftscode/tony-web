import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ThemeService {
    readonly isDark = signal<boolean>(false);
    private readonly faviconId = 'appFavicon';

    constructor() {
        this.ensureFaviconElement();
        const isPreferenceDark: boolean = !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (isPreferenceDark) {
            this.toggleDarkMode();
        }
        this.isDark.set(isPreferenceDark);
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