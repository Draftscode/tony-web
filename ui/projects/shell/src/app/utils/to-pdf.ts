import { TranslateService } from "@ngx-translate/core";
import { Suggestion } from "../features/authorized/form/dialogs/form-dialog";



export type TableRow = {
    type: string;
    insurer: any;
    scope: string;
    suggestion: Suggestion;
    oneTimePayment: number;
    contribution: number;
    party: string;
    nr: string;
    fromTo: string;
    monthly: boolean;
}

export type Group = {
    items: TableRow[];
    name: string;
}

type Person = {
    title: string;
    firstname: string;
    lastname: string;
    street: string;
    gender: string;
    email: string;
    company: string;
    city: string;
    streetNo: string;
    zipCode: string;
};

export type Content = {
    persons: Person[],
    groups: Group[],
}

export function toPdf(content: Content, translate: TranslateService) {

    const styles = `
    .wrapper {
    overflow: hidden;
    border-radius: 8px;
    }
    table {
        width: 100%;
        margin: 20px 0;
        border-radius: 4px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        border: 1px solid rgb(220,220,220);
        border-radius: 4px;
        overflow: hidden;
    }

//     thead {
//       display: table-header-group;
//       }

//       @media print {
//   thead {
//     display: table-row-group !important; /* This disables repetition */
//   }
}
        tr {
            break-inside: avoid;
            page-break-inside: avoid; /* fallback for older Chromium */
        }
        tr.even {
        background-color: rgb(240,240,240);
        }

        tr.odd {
        background-color: transparent;
        }

        tr th {
            padding: 6px;
            text-align: left;
            color: white;
            background-color:rgb(25, 66, 109)
        }

        tr td {
        padding: 6px;
        vertical-align: top;
        max-width: 320px;
        word-break: break-word;
        }

        tr.border-row td {
            border-bottom: 1px solid rgb(220,220,220);
        }

        span.cell-header {
            font-weight: 600;
            padding-bottom: 4px;
        }

        .signature {
        margin-top: 80px;
         page-break-inside: avoid;
        }

        .signature-field {
        margin-top: 40px;
        }

        tr.border-top td {
        border-top: 1px solid rgb(51, 51, 51);
        }

`

    const defaultImage = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QCWRXhpZgAASUkqAAgAAAADAA4BAgBMAAAAMgAAABoBBQABAAAAfgAAABsBBQABAAAAhgAAAAAAAABObyBpbWFnZSB2ZWN0b3Igc3ltYm9sLCBtaXNzaW5nIGF2YWlsYWJsZSBpY29uLiBObyBnYWxsZXJ5IGZvciB0aGlzIG1vbWVudCAuLAEAAAEAAAAsAQAAAQAAAP/hBcxodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iPgoJPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KCQk8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOklwdGM0eG1wQ29yZT0iaHR0cDovL2lwdGMub3JnL3N0ZC9JcHRjNHhtcENvcmUvMS4wL3htbG5zLyIgICB4bWxuczpHZXR0eUltYWdlc0dJRlQ9Imh0dHA6Ly94bXAuZ2V0dHlpbWFnZXMuY29tL2dpZnQvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwbHVzPSJodHRwOi8vbnMudXNlcGx1cy5vcmcvbGRmL3htcC8xLjAvIiAgeG1sbnM6aXB0Y0V4dD0iaHR0cDovL2lwdGMub3JnL3N0ZC9JcHRjNHhtcEV4dC8yMDA4LTAyLTI5LyIgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIgcGhvdG9zaG9wOkNyZWRpdD0iR2V0dHkgSW1hZ2VzL2lTdG9ja3Bob3RvIiBHZXR0eUltYWdlc0dJRlQ6QXNzZXRJRD0iMTEyODgyNjg4NCIgeG1wUmlnaHRzOldlYlN0YXRlbWVudD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL2xlZ2FsL2xpY2Vuc2UtYWdyZWVtZW50P3V0bV9tZWRpdW09b3JnYW5pYyZhbXA7dXRtX3NvdXJjZT1nb29nbGUmYW1wO3V0bV9jYW1wYWlnbj1pcHRjdXJsIiBwbHVzOkRhdGFNaW5pbmc9Imh0dHA6Ly9ucy51c2VwbHVzLm9yZy9sZGYvdm9jYWIvRE1JLVBST0hJQklURUQtRVhDRVBUU0VBUkNIRU5HSU5FSU5ERVhJTkciID4KPGRjOmNyZWF0b3I+PHJkZjpTZXE+PHJkZjpsaT5PbmTFmWVqIFByb3M8L3JkZjpsaT48L3JkZjpTZXE+PC9kYzpjcmVhdG9yPjxkYzpkZXNjcmlwdGlvbj48cmRmOkFsdD48cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPk5vIGltYWdlIHZlY3RvciBzeW1ib2wsIG1pc3NpbmcgYXZhaWxhYmxlIGljb24uIE5vIGdhbGxlcnkgZm9yIHRoaXMgbW9tZW50IC48L3JkZjpsaT48L3JkZjpBbHQ+PC9kYzpkZXNjcmlwdGlvbj4KPHBsdXM6TGljZW5zb3I+PHJkZjpTZXE+PHJkZjpsaSByZGY6cGFyc2VUeXBlPSdSZXNvdXJjZSc+PHBsdXM6TGljZW5zb3JVUkw+aHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMTI4ODI2ODg0LT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybDwvcGx1czpMaWNlbnNvclVSTD48L3JkZjpsaT48L3JkZjpTZXE+PC9wbHVzOkxpY2Vuc29yPgoJCTwvcmRmOkRlc2NyaXB0aW9uPgoJPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0idyI/Pgr/7QCcUGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAH8cAlAADE9uZMWZZWogUHJvcxwCeABMTm8gaW1hZ2UgdmVjdG9yIHN5bWJvbCwgbWlzc2luZyBhdmFpbGFibGUgaWNvbi4gTm8gZ2FsbGVyeSBmb3IgdGhpcyBtb21lbnQgLhwCbgAYR2V0dHkgSW1hZ2VzL2lTdG9ja3Bob3RvAP/bAEMACgcHCAcGCggICAsKCgsOGBAODQ0OHRUWERgjHyUkIh8iISYrNy8mKTQpISIwQTE0OTs+Pj4lLkRJQzxINz0+O//CAAsIAaMCZAEBEQD/xAAbAAEBAAMBAQEAAAAAAAAAAAAABgEFBwQDAv/aAAgBAQAAAAGzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+OAAAAAAAAAAD9/QAHPvgAAAAAAAAAAU1EADn3y2IAAAAAAAAAPj4qaiABz7HQgAAAAAAAAAaWRpqIAHPsdCAAAAAAAAABpZGmogAc+x0IAAAAAAAAAGlkaaiABz7HQgAAAAAeTx/f35AAAaWRpqIAHPsdCAAAAAHzktQe6v9YAAGlkaaiABz7HQgAAAABH6cPXd/oAAGlkaaiABz7HQgAAAADzQOAWG4AABpZGmogAc+x0IAAAAA1kUBTUQAANLI01EADn2OhAAAAAHlgQK7dAAA0sjTUQAOfY6EAAAAAIvVh6Lz6AAA0sjTUQAOfY6EAAAAAPhHa89Nh7wAANLI01EADn2OhAAAAABjXeP77T9gAANLI01EADn2OhAAAAAAAAAA0sjTUQAOfY6EAAAAAAAAADSyNNRAA59joQAAGl230AAAAAANLI01EADn2OhAAA1MdtrDIAAAAADSyNNRAA59joQAAeKI+aipgAAAAAGlkaaiABz7HQgAB8YbzGa3dAAAAAAaWRpqIAHPsdCAAPzFa4P3a7AAAAAAGlkaaiABz7HQgAGJTRgfe59AAAAAAaWRpqIAHPsdCAAT8uAe+2/YAAAAA0sjTUQAOfY6EABqo3AA3FfkAAAAA0sjTUQAOfY6EADxxHyABSUgAAPF5NwABpZGmogAc+x0IAPjD+UADNfuAAB5Yj5WW0ABpZGmogAc+x0IAfmM1gAB+7f3AAPhEeV+7TYgBpZGmogAc+x0IASuhAAD0XP3AB8onxD623tAGlkaaiABz7HQgDQyoAAGwtf2APnF68H3t/UAaWRpqIAHPsdCAayM/IAADdVuQH5jdWA9Vt6AGlkaaiABz7HQgPJD/IAAAU1EBiQ04A9tt9QNLI01EADn2OhA+UP5AAAAzY7YMSuiABsLT6A0sjTUQAOfY6EGIzVgAAAfS39omZ0ABtLL9BpZGmogAc+x0IJbQAAAAHpufsnpgAAbivyNLI01EADn2OhDRyYAAAAbG10spgAAN5V5NLI01EADn2OhGti/yAAAADZa7AAAFDTmlkaaiABz7HQnlh/iAAAAAAAAFNRNLI01EADn2OhfOI8QAAAAAAAAM1W90sjTUQAOffio0+rAAAAAAAAAZpPPoqaiABz74AAAAAAAAAAFNRAA0X4AAAAAAAAAANj7wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//EACgQAAAEBgIDAAMBAQEAAAAAAAACAwQBBRMVMDMyNCBAUBAREjEUgP/aAAgBAQABBQL/AND1koCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJCskKyQrJApynyrb/vynjkW3wh+425yLc5Fuci3ORbnItzkW5yLc5Fuci3ORbnItzkW5yLc5Fuci3ORbnItzkW5yLc5Fuci3ORbnItzkW5yLc5Fuci3ORbnItzkW5yLc5Fuci3ORbnItzkW5yLc5Fuci3ORbnItzkW5yLc5Fuci3ORbnItzkW5yLc5Fuci3ORbnItzkW5yLc5Fuci3ORbnItzkKtVkSiU8ci29Lb9yadUSnjkW3pbfuTTqiU8ci29Lb9yadUSnjkW3pbfiKOkEhcm4I9bn9aadUSnjkW3pbfhHOVMjl+otH8oO1W8W7gjgnpzTqiU8ci29Lb8KYOaqvi3Xi3VLGBi+lNOqJTxyLb0tvwVz0kPOWKf229KadUSnjkW3pbfgzDpecp4+lNOqJTxyLb0tvwXJKjfzlhP5belNOqJTxyLb0tvwn7eit4opGXVIWBCelNOqJTxyLb0tvwlUirJuWajeP5RQUXM1albE9OadUSnjkW3pbfiKMG6gtSQJLW5QUsCw9SadUSnjkW3pbfuTTqiU8ci29Lb9yadUSnjkW3pbfTczCCKxDlUJ8eadUSnjkW3pbfSfO6BAxd0D/AB5p1RKeORbelt9F04K2TOcyh/xL3n6+PNOqJTxyLb0tvoKqlRTXXM4U8GDusX4s06olPHItvS254xgWDx1Fyp4lNEhmjmDlP4k06olPHItvS2537yrHzRVMgoisVdP4c06olPHItvS25pg8/nE1cxbKFNA5fhTTqiU8ci29Lbleu/8AnJ/scTF3RN8KadUSnjkW3pbcjlwVukc5lD5Je89Ny5K2TZPa+aadUSnjkW3pbcaihUk3C5nCuZi7rl9BdcrdNZYy6kIxLFm7g4LkmnVEp45Ft6W3FGMIQeOouFM5TRIZq5g5TzLLFQTXXM4U/BTGIZo6K5JjmnVEp45Ft6W3FMHlSPoorGQURVKsnkUUKkRy5M5U8E1DJHbOSuU8U06olPHItvS24Zg8/iHptHUWyhTQMXEc5SFdujOT+SKpkVG65XCeGadUSnjkW3pbcD11BuSMYxj6jB3RNhjGBYPHcXBsCC5m6iKxV08E06olPHItvS2+bhcrdJRQyp/Wl7z94P8AA+eV44mzkzZRNQqpPOadUSnjkW3pbfJRQqRHLgzhX2GLuuTyfPamVo6M2OQ5VC+U06olPHItvS2+MY/qD13/ANB/ZIcyZ2rgrlPwfvf3nZu4tzQjA0PGadUSnjkW3pbfGYPP6j7aC5m6qSpVk/w/e/r0WTyhH/YeE06olPHItvS2+EweU4e6zdRbKQjA0Hz2lD0mL2nHwmnVEp45Ft6W38vHUG6cYxNH3kXqiKX+x9Ng9/XhNOqJTxyLb0tv4XXK3SVUMsp9Vg9/f5mnVEp45Ft6W0HOVMjlwZyr9di9qfiadUSnjkW3kj/J7qiHjyLmP2P8CM0hBN49TcIiU8ci2/78p45Dyspz2kgtJBaSC0kFpILSQWkgtJBaSC0kFpILSQWkgtJBaSC0kFpILSQWkgtJBaSC0kFpILSQWkgtJBaSC0kFpILSQWkgtJBaSC0kFpILSQWkgtJBaSC0kFpILSQWkgtJBaSC0kFpILSQWkgtJBaSC0kFpILSQWkgtJBaSC0kFpILSQWkgtJBaSBq1g1h/wC1P//EADIQAAECAwYEBgICAgMAAAAAAAEAAjNykQMRMDKBoRASMUATICFBUFEiQlJhYnFggLH/2gAIAQEABj8C/wCw8RtVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlVFZVRWVUVlV+Lgf8AWLaTH/gFppi2kxVw91k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1k3WTdZN1zWjbh/vhaaYtpMUyb50TcLTTFtJimTfOibhaaYtpMUyb50TcLTTFtJimTfC/naC9dXUXpaAf79O2E3C00xbSYpk3wZc43ALlZ+DP8A3yfib2/xK5m6j67QTcLTTFtJimTfB+GMjPMHjUIOHQ9mJuFppi2kxTJvgnv+hgcv8Td2Ym4WmmLaTFMm+CfpgWunZibhaaYtpMUyb4J7f6wOb+R7MTcLTTFtJimTfB3jI7p5gxvug0dB2Ym4WmmLaTFMm+DLHj0X2z+XkuY3Venq49T2gm4WmmLaTFMm+Fycp/xURy9QXf7KuaAB/XaibhaaYtpMUyb50TcLTTFtJimTfOibhaaYtpMUybtAxo5rsyDmm8H4gTcLTTFtJimTdnytiHbhyOhnb4gTcLTTFtJimTdlzHr7BFzjeTx8C0Mp+HE3C00xbSYpk3Yl7+gRe7QfXl8N5/Mb/DCbhaaYtpMUybsLybgF6ZB0HmDmm4hf5DqPhRNwtNMW0mKZN2HhMP4Dr/eAHtQe34QTcLTTFtJimTY/g2Z9f2OFf+p6hBzTeD8GJuFppi2kxTJsblbnOyvOHyPyHb4MTcLTTFtJimTYvMevsEXuN5OKLC0Mp7O89fYLkf6P/wDcYTcLTTFtJimTYhe8+gXO7QfWPyPzjfsed2g+0XvV4NxC5XRBviibhaaYtpMUybDvPRXDIOnYBzTcQr/2HUY5e9cztB9cQ5puIX08dRiCbhaaYtpMUybD8GzP4jqfvsg9qD24pe83AK89PYeUPYbiFeOvuMMTcLTTFtJimTYXg2Z/I9T9dp/geoQc03g4Zc43AL6YOg84exczdR9YQm4WmmLaTFMmwbhnPRXnr2vhvP4HbCvJuAVzfSzG+Dzt1H2g9mCJuFppi2kxTJsDnOg+0XuPqe38C0MpweRkMb4fMOnuEHsN4OAJuFppi2kxTJvOXuNwC5j09h3PK6IN/P4Vmfw9z94v2w9Qg5pvB84m4WmmLaTFMm815Vzcg6f33Qc03ELmHX3HlNjZH0/Y49x9bM9VeDeD5hNwtNMW0mKZN5vBsz6fsfvvA9uo+0Hs6HibGyPr+x7HkfDOyvHlE3C00xbSYpk3l8KzP5Hr/XfeuQ9QrwbwV4Vmfz9z9dn4Vofw9j9eUTcLTTFtJimTeT0znorz6k9+6zGn9K89oLG1Pp+p8gm4WmmLaTFMm487tB9ovf1PywsbU+v6niJuFppi2kxTJuBe43ALmPT2HzHhWh/P2P3wE3C00xbSYpp+isr1c30YPb5oC1aS77C5GhwN9/rwtNMW0mP/AAC00xS7xD6m/oopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopoopooponXOv5v+6v/8QALBAAAQEFBwUAAwEBAQAAAAAAAQARIVGhsRAwMWGR8PEgQEFQwXGB0WCA4f/aAAgBAQABPyH/AKHJBBGR4ZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZXGVxlcZTSdeLTb3eo/4Cd+r3eoow8YmBZPSsnpWT0rJ6Vk9KyelZPSsnpWT0rJ6Vk9KyelZPSsnpWT0rJ6Vk9KyelZPSsnpWT0rJ6Vk9KyelZPSsnpWT0rJ6Vk9KyelZPSsnpWT0rJ6Vk9KyelZPSsnpWT0rJ6Vk9KyelZPSsnpWT0rJ6Vk9KyelZPSsnpWT0rJ6Vk9KyelZPSsnpWT0rJ6Vk9KyelY7oxrBsnfq93qKklfeymhsnfq93qKklfeymhsnfq93qKklfeymhsnfq93qKklfSkGAwB5ki3xFPsKQUC0NHaymhsnfq93qKklfRjDYoo4IYAx/LoEM0wE0e8YmPaJTQ2Tv1e71FSSvozFK8Z+T1YVGEYIqLQNB7OU0Nk79Xu9RUkr6JmmJWflY9ZGov0nZymhsnfq93qKklfRbLMXDeQ367OU0Nk79Xu9RUkr6Io/Eu/m4OQ44/HZymhsnfq93qKklfRlOJ63Jl1Y42IwEUHdgWDs5TQ2Tv1e71FSSvo2kApIjJEIPvQ0OMfAJhJh9pKaGyd+r3eoqSV9IQ0MKKN/IJiLZzH9Iy3Z3hA4q8AztZTQ2Tv1e71FSSvvZTQ2Tv1e71FSSvvZTQ2Tv1e71FSSvaCXNOKYBk0H1EpobJ36vd6ipJXswtty7JFEklpLSUVsvdUUCCGh4Pp5TQ2Tv1e71FSSvZFLw3RimgZNJtbA4eanp5TQ2Tv1e71FSSvYkiZMX8qB0+E24w+mlNDZO/V7vUVJK9gcjANJKxAHLdRIBDQQmtcOa9LKaGyd+r3eoqSV7BsvQ8PL+XBa3jEREEatxxED6SU0Nk79Xu9RUkrfspfOB4yuvPTpTPomg+jlNDZO/V7vUVJK3wmo0bvpEkhGk4m7f8AP9ax9FKaGyd+r3eoqSVvSJ+ToxTdkn3s4KnZ40j/AHoAuQ6BfSmhsnfq93qKklbxnkQWOBhAX2BaE/Z3p7E9LUJEgaTgIBDJxDQQnbAB4qvZTQ2Tv1e71FSSt2RmAANJKfpGGjn2DfomgrxW4hX5IGAYCJR6d36AtO2KaCF4TyK8lNDZO/V7vUVJK3bReJ15dkbt4xEQi9uPiBvjgsKQ/r6igsKQ/ru5TQ2Tv1e71FSSt00oAvCHaNq88sgYAGgi7A2CaSV5TyLrLgwjxFBuP+wrqU0Nk79Xu9RUkrctWg4aGaIiEk8k9r5TbifO6ORgGklP3EOFVyOloAiQNBxEDcymhsnfq93qKklbg6enCITZl28yB4GJ5yuCQBJLAMSitdhLvjRP99z8FKaGyd+r3eoqSV62BJPRE7B0IdwCQWgsIQW25fkj1tpcmBu698p5EgFgmgjrlNDZO/V7vUVJK9QCEYBiSjNZh/8A07poGTQUEuBdCPT+OAPnK/fvJchmhsYBoI6pTQ2Tv1e71FSSvU2nTgeUO8/lAESJsi38MAfGXYna7SKCAEaDgR0ymhsnfq93qKklelpuk8PD+99iAeWQyMA0EJsPTA3f2bKemJu7plNDZO/V7vUVJK9DFMHDwzRyckNJPfv+QcZUkkI0nEntPwwF8ZdEpobJ36vd6ipJW00/oEWJsj2344C+crZTQ2Tv1e71FSStjIEmko4cC6EPcMocmJu+yU0Nk79Xu9RQSuACuHH9QiI4YvJ9yCSBBYRgUGFHOXoaDAuBZO/V7vUf8BO/V6SY2zH+ACEIQhCEIQhCEIQhCEIQhCEIQhCEIQhCEIQhCEIQhCEIQhCEIQhCEIMHdYj/ALV//9oACAEBAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAP/wD/AP8A/wD/AP8A/wDwAF//AP8A/wD/AP8A/wD+gAIAAAAAAAAADAAQAAAAAAAAAGAAgAAAAAAAAAMABAAAAAAOAAAYACAAAAAA6AAAwAEAAAAAH4AABgAIAAAAAX8AADAAQAAAAA/wAAGAAgAAAAA/wAAMABAAAAAB+gAAYACAAAAAD6AAAwAEAAAAAC4AABgAIAAAAAAAAADAAQAAAAAAAAAGAAgAACAAAAAAMABAAACAAAAAAYACAAAcAAAAAAwAEAAD0AAAAABgAIAAP0AAAAADAAQABf4AAAAAGAAgAB/wAAAAAMABAAP/APAAAAAGAAgAL/8AgAAYADAAQAP/APgAAMABgAIAL/8A8AAPgAwAEAD/AP8AwAB8AGAAgA//AP6AH/ADAAQAf/8A+gD/AKAYACAf/wD/APAP/gDAAQH/AP8A/wABf/4GAAgP/wD/APwH/wDgMABA/wD/AP8A+H//AIGAAgf/AP8A/wDj/wD/AIwAEL//AP8A/wB//wD8YACP/wD/AP8A/wD/AP8A8wAEP/8A/wD/AP8A/wD/AFgAL/8A/wD/AP8A/wD/AP8AQAH/AP8A/wD/AP8A/wD/AP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//xAAsEAABAgMHBAIDAQEBAAAAAAABAPARUcEhMDFBYdHxIEBQcZGhEIGxYIDh/9oACAEBAAE/EP8AocxaIEhEH5TiqnFVOKqcVU4qpxVTiqnFVOKqcVU4qpxVTiqnFVOKqcVU4qpxVTiqnFVOKqcVU4qpxVTiqnFVOKqcVU4qpxVTiqnFVOKqcVU4qpxVTiqnFVOKqcVU4qpxVTiqnFVOKqcVU4qpxVTiqnFVOKqcVU4qpxVTiqnFVOKqcVU4qpxVTiqnFVOKqEEFyOD3C9cJv8A/SvThMg6REBMmwJt1Tbqm3VNuqbdU26pt1Tbqm3VNuqbdU26pt1Tbqm3VNuqbdU26pt1Tbqm3VNuqbdU26pt1Tbqm3VNuqbdU26pt1Tbqm3VNuqbdU26pt1Tbqm3VNuqbdU26pt1Tbqm3VNuqbdU26pt1Tbqm3VNuqbdU26pt1Tbqm3VNuqbdU26oPAOIhaDE5HQ/h+lenCZPMnn2j9K9OEyeZPPtH6V6cJk8yefaP0r04TJ5k8KdCrExF7ERCDgAEwUEFGHIP2NiAAgIIiCDYe3aP0r04TJ5k8GDOsSPFYKugkBaqD76IzES0RP1I6hBsFYY4kd+2aP0r04TJ5k8Ha5xYNmef1gP3PqP6THaLM8bINEcNmCIjtWj9K9OEyeZPBHJoFPqH2QiSRJMSbST12hRYe1o/pH67Vo/SvThMnmTwRkQPa4jgNF7h2po/SvThMnmTwQj4nEZhaPsC4GrAk9CwfYPatH6V6cJk8yeDgfyjAWFm2XUEu0wLM4vShtlFoO1aP0r04TJ5k8HPzfMsiDkUWKY2Wz0GR6A63NpZrkovMBhEFugSHbNH6V6cJk8yeEAQAIIgQcCjYyNj/Bw+kVEDIYqIOOxlYfECwcxCAP0O3aP0r04TJ5k8+0fpXpwmTzJ59o/SvThMnmTtAQC1xwEmuf0hDIEPFNH6V6cJk8ydnCHO6TWSIjiIkkxJKjBm1R+JpNARABEEGII8S0fpXpwmTzJ2UEiPi3AZo6yJD84xWwjAz0+JeJaP0r04TJ5k7GE5GGZZAalELhGwBsyAOgEgxBgQhhzADgZ+xn8z8Q0fpXpwmTzJ2B/xC0AAM1a0WIJnq1P11DKGxYFDBwcAU5ND4do/SvThMnmTsJyy2FR9/FxDFHtMM4tFlsguOcD4Zo/SvThMnmS/wABpgRhOTU53QqMYUPMTGoQoQILMeFaP0r04TJ5kvoOVjcYJqI+AokhiSZ3ZxH4Qn5PRz+UCABBBBtBGfhGj9K9OEyeZL2HhjjbtDNH1RIj/Bpe/ERX3p8S7Mhhx4iWnsMyi4kaIhZotRL99g0fpXpwmTzJeQlHiZk5AalGUmKyRvfAkBCCDEEZIYR88fk9z+exjYDgE+gN1gVUDDKA0QPgCUCCM1HpJUAkqL9o/SvThMnmS7OrUQgABmo6CZGHFNr/AAdgelAlkUOhCHDzTGhv8CqwY5QGqhZMAz6A3/OehUwKt1A//Fp/L5o/SvThMnmS7ygARhZDQfZ7LLIB8M4FRVY7Sxzgdb0YUCJOZ0EyimPHiJYO5zPSdaREHI6GYQzDhxEtPY5G9aP0r04TJ5kusJygZiZNT9DtAAooAKUmoQmBsGIN3IYqYKyURO61P114PVksBzB0RcoBYc+gd7xo/SvThMnmS5gnHOhmpMo59SQiSTn2pw5gTEoc/maBiIjC5P8AiEoAAKPaQolNQZXMbAMCH0DusKqiY5wOt20fpXpwmTzJcFli4u2R6mVFvWJOQkBoO3wqqBmCfWXxcDLBRIYACaKTbQIsiGZ0kP36ugGJDiJYO4yKAVAiDmDmDI3TR+lenCZPMnWCdEioNVEyxBs3pnuAM4iIIMCCoQ42Saz6iQBEmACPb4QOxSDRvYjtHF+mo+1MKqC5aP0r04TJ5k6gYBySIAAZqJpYzCKandHWQIKCRDxbgcumIsVaH7AZTN/FrMCTkqM0O8QtEEG4aP0r04TJ5k6sSjgRgZNBnM94QOMLCGzMBUJyMMyzB1H5hbV2h+4Gczl/OwFycQxJHMaTH79jwDRIiCJ9bR+lenCZPMnTMw2xsvb6HfQ6RYAGWjUfaH+IUiCDmhxMDAzAcg0ESSSSYk4k9keNhYGYpFoIEEAgxBwI6mj9K9OEyeZOiNkKQX7NB9okkBCJJOffk7AtqtI4kT9TR8BUSIkmfaRtq7Q+Yykcv50tH6V6cJk8yfk48SLAG3IAUcTv0GQGg8tAWKtD9CM5HpaP0r04TJ5k/AXUSDxUcKPi3E5+XBIMQYEIdnhA7BItHoaP0r04TISZJaBjAGP47WoicROMPrzJyxUQGBBmrbpYBAZmJECj34BEEACMiZ/h+lenCb/AP0r0SyEACyJjBce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dce3XHt1x7dRBmIwhCEd/wDtX//Z`;

    let html = `<style>${styles}</style>`;
    let tables = ``;

    content.groups.forEach((group) => {
        let rows = ``;
        let _switch = 1;
        let totalOnce = 0;
        let existed = 0;
        let savings = 0;
        let current = 0;


        group.items.forEach((row) => {
            let cells = ``;
            const suffix = row['suggestion']?.value === 'terminated' ? -1 : 1;
            let contrib = Number.parseFloat(`${row['contribution']}`);
            if (!row['monthly']) {
                contrib = (contrib / 12);
            }

            const img = row['insurer']?.logo ? row['insurer'].logo : defaultImage;

            cells += `<td>
            <div>${row['type'] ?? '-'}</div></td>`;
            cells += `<td>
            <div>${row['nr'] ?? '-'}</div></td>`;
            cells += `<td>
            <div style="display: flex; align-items: center; gap: .25rem">${row['insurer'] ?
                    `<img style="height: 32px; width: 100px; padding: 4px; min-width: 100px; object-fit: contain" src="${img}" /><span>${row['insurer'].name}</span>` : '-'}</div></td>`;
            cells += `<td>
            <div>${row['party'] ?? '-'}</div></td>`;
            cells += `<td>
            <div>${row['suggestion'].label ?? '-'}</div></td>`;


            cells += `<td>
            <div>${row['scope'] ?? '-'}</div></td>`;
            cells += `<td>
            <div class="cell">
            <div>${row['fromTo'] ?? '-'}</div></div></td>`;
            cells += `<td>
            <div>${row['oneTimePayment'] ?? '-'}€</div></td>`;
            cells += `<td>
            <div>${contrib.toFixed(2) ?? '-'}€</div></td>`;
            // rows += `<tr class="${_switch === 1 ? 'odd' : 'even'} border-row">${lowerCells}</tr>`
            rows += `<tr class="${_switch === 1 ? 'odd' : 'even'}">${cells}</tr>`;



            if (row['suggestion']?.value === 'terminated') {
                savings += contrib;
                existed += contrib;
            }

            if (row['suggestion']?.value === 'inventory') {
                existed += contrib;
                current += contrib;
            }

            if (row['suggestion']?.value === 'new') {
                totalOnce += suffix * Number.parseFloat(`${row['oneTimePayment']}`);
                savings -= contrib;
                current += contrib;
            }

            if (row['suggestion']?.value === 'acquisition') {
                current += contrib;
                existed += contrib;
            }

            _switch *= -1;
        });

        const table = `
        <h2>${group.name}</h2>
        <table cellspacing="0" cellpadding="0">
        <thead>
            <tr>
                <th style="width: 10%">${translate.instant('label.product')}</th>
                <th style="width: 10%">${translate.instant('label.insurer.no')}</th>
                <th style="width: 16%">${translate.instant('label.insurer.no')}</th>
                <th style="width: 10%">${translate.instant('label.insured.short')}</th>
                <th style="width: 10%">${translate.instant('label.suggestion')}</th>
                <th style="width: 20%">${translate.instant('label.scope')}</th>
                <th style="width: 10%">${translate.instant('label.fromTo')}</th>
                <th style="width: 7%">${translate.instant('label.oneTimePayment')}</th>
                <th style="width: 7%">${translate.instant('label.contribution.label')}</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
            <tr class="border-top">
                <td colspan="7">${translate.instant('label.finances.old')} (${translate.instant('label.frequency.monthly')})</td>
                <td><b></b></td>  
                <td><b>${existed.toFixed(2)} €</b></td>
            </tr>
            <tr>
                <td colspan="7">${translate.instant('label.finances.new')} (${translate.instant('label.frequency.monthly')})</td>
                <td><b>${totalOnce.toFixed(2)} €</b></td>  
                <td><b>${current.toFixed(2)} €</b></td>
            </tr>
            <tr>
                <td colspan="7">${translate.instant('label.finances.savings')} (${translate.instant('label.frequency.monthly')})</td>
                <td><b></b></td>  
                <td><b>${savings.toFixed(2)} €</b></td>
            </tr>
        <tbody>
        </table>
        </div>`;

        tables += table
    })
    let personHtml = ``;
    let signature = ``;
    content.persons.forEach(person => {
        const salutation = person.gender ? translate.instant(`label.salutation.${person.gender}`) : '';
        personHtml += `
        <div class="p">
        ${person.company ? `<div style="padding: 4px">${person.company}</div>` : ''}
    <div style="padding: 4px">${salutation} ${person.title ?? ''}</div>
    <div style="padding: 4px">${person.firstname} ${person.lastname}</div>
    <div style="padding: 4px">${person.street ?? ''} ${person.streetNo ?? ''}</div>
    <div style="padding: 4px">${person.zipCode ?? ''}</div>
    <div style="padding: 4px">${person.city ?? ''}</div>
  </div>`;

        signature += `<div class="p"><div><b>${translate.instant('label.signature')}</b></div>
<div class="signature-field">_______________________________</div>
<div>${person.firstname} ${person.lastname}</div></div>`;
    })

    html += `
    <div style="display: flex; gap: 12px;">
${personHtml}
</div>
<div class="wrapper">
${tables}
<div class="signature" style="display: flex; gap:4px; w-full; justify-content: space-between">
${signature}
</div>
`;

    return html;
}