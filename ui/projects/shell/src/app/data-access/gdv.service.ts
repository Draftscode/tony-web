import { Injectable } from "@angular/core";

export type GdvMember = {
    name: string;
    image: string;
};

@Injectable({ providedIn: 'root' })
export class GdvService {

    async getGdvMembers(query: string) {
        return [] as GdvMember[];
        // return lastValueFrom(this.electronService.handle<GdvMember[]>(`api/gdv/members`, { query }));
    }
}