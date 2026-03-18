import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type RecentFile = {
  id: number;
  filename: string;
  lastModified: string;
};

export type Stats = {
  customersCount: number;
  filesCount: number;
  companiesCount: number;
  contractsCount: number;
  usersCount: number;
  unreadMessagesCount: number;
  contractsExpiringSoonCount: number;
  recentFiles: RecentFile[];
};

const ORIGIN = `${environment.origin}/stats`;

@Injectable({ providedIn: 'root' })
export class StatsService {
  getStats() {
    return httpResource<Stats>(() => ({
      url: ORIGIN,
      method: 'GET',
    }));
  }
}
