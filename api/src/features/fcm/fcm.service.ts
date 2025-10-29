import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as admin from 'firebase-admin';

const keys = JSON.parse(readFileSync('src/tonym-web-firebase-adminsdk-fbsvc-91736100ff.json', 'utf-8'));

admin.initializeApp({
    credential: admin.credential.cert(keys),
});


@Injectable()
export class FcmService {
    async sendNotification(token: string, title: string, body: string) {
        const message = {
            notification: { title, body },
            token,
        };
        return admin.messaging().send(message);
    }

    async broadcastToTopic(topic: string, title: string, body: string) {
        const message = {
            notification: { title, body },
            topic,
        };
        return admin.messaging().send(message);
    }

    async subscribeTokenToTopic(token: string, topic: string = 'all') {
        await admin.messaging().subscribeToTopic(token, topic);
        Logger.debug(`Token subscribed to topic: ${topic}`);
    }
}