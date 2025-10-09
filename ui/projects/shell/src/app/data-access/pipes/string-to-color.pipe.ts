import { Pipe, PipeTransform } from "@angular/core";

type ToColorOptions = {
    contrast: boolean;
};

@Pipe({
    name: 'toColor',
})
export class StringToColorPipe implements PipeTransform {
    transform(str: string, options?: Partial<ToColorOptions>): string {
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash; // Convert to 32bit integer
        }

        // Map hash to a hue (0 - 360)
        const hue = Math.abs(hash) % 360;

        // Full saturation and lightness = 50% for vibrant colors
        const hsl = `hsl(${hue}, 90%, 50%)`;

        if (options?.contrast) {
            return this.getContrastTextColor(hsl);
        }

        return hsl;
    }

    private getContrastTextColor(hsl: string): string {
        // Extract H, S, L from "hsl(hue, sat%, light%)"
        const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!match) return "#000"; // fallback

        const h = Number(match[1]);
        const s = Number(match[2]) / 100;
        const l = Number(match[3]) / 100;

        // Convert HSL to RGB
        const a = s * Math.min(l, 1 - l);
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
        };
        const r = f(0);
        const g = f(8);
        const b = f(4);

        // Calculate luminance (perceived brightness)
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Return black or white for contrast
        return luminance > 0.5 ? "#000000" : "#FFFFFF";
    }
}