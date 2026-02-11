import { TONYM_LOGO } from "./tonym";

export const usePdfPreset = (logo: string | undefined, html: string) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>PDF Export</title>
        <style>
            body {
                font-family: "Arial", "Roboto", "Noto Sans", sans-serif;
                font-size: 16px;
            }
        </style>
    </head>
    <body>
    <div style="display: flex; justify-content:end">
        <img style="width: 100px; height: auto" alt="Logo" src="${logo ? logo :
            TONYM_LOGO
        }" /></div>
         ${html}
    </body>
    </html>`
};