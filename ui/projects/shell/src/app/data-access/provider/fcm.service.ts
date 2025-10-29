import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Messaging } from '@angular/fire/messaging';
import { getToken, onMessage } from 'firebase/messaging';
import { MessageService } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FcmService {
    private readonly messaging = inject(Messaging);
    private readonly http = inject(HttpClient);
    private readonly pMessage = inject(MessageService);

    readonly isGranted = signal<boolean>(false);

    constructor() {
        this.isGranted.set(Notification.permission === 'granted');
    }

    requestPermission(): Promise<string> {
        return Notification.requestPermission().then((permission) => {
            this.isGranted.set(Notification.permission === 'granted');
            if (permission === 'granted') {
                return getToken(this.messaging, { vapidKey: environment.vapid });
            } else {
                throw new Error('Permission denied');
            }
        });
    }

    sub(token: string, topic: string = 'all') {
        return this.http.post(`${environment.origin}/notifications/subscribe`, { token, topic });
    }

    async listen() {
        const token = await this.requestPermission();
        if (!token) {
            console.warn('Messaging is disabled');
            return;
        }
        await lastValueFrom(this.sub(token));
        onMessage(this.messaging, (payload) => {
            console.log('Message received: ', payload);
            const detail = JSON.parse(payload.notification?.body ?? '');

            this.pMessage.add({
                severity: 'info',
                summary: payload.notification?.title,
                detail: detail?.message
            });
        });
    }
}