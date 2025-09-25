export type FileDataPerson = {
    title: string;
    gender: "male" | "female";
    firstname: string;
    lastname: string;
    street: string;
    streetNo: string;
    city: string;
    company: string;
    zipCode: string;
};

export type FileDataGroupItem = {
    contribution: number;
    fromTo: [string, string];
    insurer: {
        image?: string;
        logo: string;
        name: string;
    };
    monthly: boolean,
    nr: string;
    oneTimePayment: number;
    party: string;
    scope: string;
    suggestion: {
        value: "acquisition",
        label: "Übernahme"
    };
    type: string;
};

export type FileDataGroup = {
    name: string;
    items: FileDataGroupItem[];
};


export type FileData = {
    persons: FileDataPerson[];
    groups: FileDataGroup[];
};