export function base64ToFile(
    base64: string,
    fileName: string
): File {
    if (!base64) {
        throw new Error('Base64 string is empty');
    }

    // Extract mime type if present (data URL format)
    let mime = '';
    let base64Data = base64;

    const matches = base64.match(/^data:(.+);base64,(.*)$/);

    if (matches) {
        mime = matches[1];
        base64Data = matches[2];
    }

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    return new File([byteArray], fileName, {
        type: mime || 'application/octet-stream'
    });
}
