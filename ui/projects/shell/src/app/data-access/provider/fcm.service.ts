import { inject, Injectable } from '@angular/core';
import { Messaging } from '@angular/fire/messaging';
import { getToken, onMessage } from 'firebase/messaging';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FcmService {
    private readonly messaging = inject(Messaging);

    requestPermission(): Promise<string> {
        return Notification.requestPermission().then((permission) => {
            console.log('p', permission)
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