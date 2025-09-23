import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly _isDark = signal<boolean>(false);

    constructor() {
        const htmlElement = document.documentElement;


        const isPreferenceDark: boolean = !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (isPreferenceDark) {
            this.toggleDarkMode();
        }
        this._isDark.set(isPreferenceDark);


    }

    toggleDarkMode(): void {
        const htmlElement = document.documentElement; // Gets the <html> tag
        htmlElement.classList.toggle('p-dark');
        this._isDark.set(this.isDarkMode());
    }

    private isDarkMode(): boolean {
        return document.documentElement.classList.contains('p-dark');
    }

    get isDark() {
        return this._isDark;
    }
}