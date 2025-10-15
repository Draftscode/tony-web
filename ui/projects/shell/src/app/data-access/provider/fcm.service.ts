import { inject, Injectable, signal } from '@angular/core';
import { Messaging } from '@angular/fire/messaging';
import { getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FcmService {
    private readonly messaging = inject(Messaging);

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

    listen() {
        onMessage(this.messaging, (payload) => {
            console.log('Message received: ', payload);
        });
    }
}