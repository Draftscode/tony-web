let api = "https://mitarbeiterwebservice.maklerinfo.biz/service";
let grant = {
    "version": "v1",
    "id": "8fcc2bf4-98f0-4b6e-bb73-c25252a1b000",
    "issuer": "https\/\/auth.dionera.dev\/clients\/fcece489-e5d1-4cf5-9654-35c8d5dec758",
    "token_endpoint": "https:\/\/auth.dionera.com\/oauth2\/token",
    "audience": "https:\/\/auth.dionera.com\/oauth2\/token",
    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "sub": "00GKFG_RZB6QA",
    "scope": [
        "ameise.stocks",
        "ameise\/mitarbeiterwebservice"
    ],
    "jwk": {
        "kid": "26116151-f030-44fa-9555-cef2d1330781",
        "kty": "EC",
        "crv": "P-521",
        "d": "AWF_VOJ6Q_lWLBHawhXVJCUfi-duVZW8e3xQr60SNrgD_ZD9BYuNomndvjTawXA9rbhwoHo3djzd6X6NTE4vKVWr",
        "x": "AEY6NJVCvJgex1qrwiM-DV9NwLsHOUXAh7ulxfAf6D9B15NbzAly7WbpIOwIZsAckyOgdA1ulbY1n7a6FGAWUznT",
        "y": "AATgcojK0dwuA9DPiBXAeNhSE_y5hrsBgI1ROm5XT-vwHUTbJtuzDJTx85vG6IoICHypXScn0xJK-2_TgsVqz8g_"
    },
    "client_id": "fcece489-e5d1-4cf5-9654-35c8d5dec758",
    "client_secret": "yF2yIwb3doTauiyBFnLcMBhtIs-dTQ5I5KveECituMZ6PXgz9rioho1Tb11rf_mugbQp9TJs",
    "create_at": "2025-08-08T09:32:44Z",
    "expires_at": "2028-08-08T09:32:43Z",
    "broker": {
        "id": "00GKFG",
        "parent_id": "00GKFG",
        "root_id": "00GKFG",
        "is_root": true
    },
    "client": {
        "id": "1001"
    }
};

export const GRANT = grant;

export type GrantType = typeof GRANT;

export const API = api;