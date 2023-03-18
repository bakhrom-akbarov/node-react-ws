import * as WebSocket from "ws";
import * as http from "http";
import express from "express";
import * as Yup from "yup";
import { countSubscribers, subscribe, unSubscribe } from "./storage";

export const app = express();

export const server = http.createServer(app);

export const WSServer = new WebSocket.WebSocketServer({ server });

type Message = {
  type: 'Subscribe' | 'Unsubscribe' | 'CountSubscribers' | 'Error';
  updatedAt?: number;
  status?: 'Subscribed' | 'Unsubscribed';
  error?: string;
  userId?: string;
};

const currentTimeStampMS = new Date().getTime();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Message validator
const isValidMessage = (m: Message) => {
  const messageSchema = Yup.object().shape({
    type: Yup.string().oneOf(['Subscribe', 'Unsubscribe', 'CountSubscribers']).required(),
    userId: Yup.string()
  })
  return messageSchema.isValidSync(m);
}

const validatePayload = (m: Message) => {
  const payloadSchema = Yup.object().shape({
    userId: Yup.string().required(),
  })
  return payloadSchema.isValidSync(m);
}

WSServer.on('connection', (ws: WebSocket) => {
  ws.on('message', async (m: string) => {
    const message: Message = JSON.parse(m.toString());
    // Hardcoded user id for simplicity. In real life project this would be a JWT token and each user would have their own connection id.
    const userId = 'user1';
    // Check if message is valid
    if (!isValidMessage(message)) {
      ws.send(JSON.stringify({ type: 'Error', updatedAt: currentTimeStampMS, error: "Bad formatted payload" }));
      return;
    } else {
      const isValidPayload = validatePayload(message);
      switch (message.type) {
        case 'Subscribe':
          if (isValidPayload && message.userId) {
            await delay(4000);
            try {
              await subscribe(userId, message.userId);
              ws.send(JSON.stringify({ type: 'Subscribe', updatedAt: currentTimeStampMS, status: 'Subscribed' }));
            } catch (e) {
              ws.send(JSON.stringify({ type: 'Error', updatedAt: currentTimeStampMS, status: e }));
            }
          } else {
            ws.send(JSON.stringify({ type: 'Error', updatedAt: currentTimeStampMS, status: 'Missing userId' }));
          }
          break;
        case 'Unsubscribe':
          if (isValidPayload && message.userId) {
            await delay(8000);
            try {
              await unSubscribe(userId, message.userId);
              ws.send(JSON.stringify({ type: 'Unsubscribe', updatedAt: currentTimeStampMS, status: 'Unsubscribed' }));
            } catch (e) {
              ws.send(JSON.stringify({ type: 'Error', updatedAt: currentTimeStampMS, status: e }));
            }
          } else {
            ws.send(JSON.stringify({ type: 'Error', updatedAt: currentTimeStampMS, status: 'Missing userId' }));
          }
          break;
        case 'CountSubscribers':
          ws.send(JSON.stringify({ type: 'CountSubscribers', updatedAt: currentTimeStampMS, count: countSubscribers(message.userId) }));
          break;
        default:
          ws.send(JSON.stringify({
            type: 'Error',
            updatedAt: currentTimeStampMS,
            error: "Requested method not implemented"
          }));
          break;
      }
    }
  });
  // Send heartbeat event every second
  const heartbeatInterval = setInterval(() => {
    const heartbeat = {
      type: 'Heartbeat',
      updatedAt: Date.now(),
    };
    ws.send(JSON.stringify(heartbeat));
  }, 1000);
  ws.on('close', function close() {
    clearInterval(heartbeatInterval);
  });
  ws.on("error", (e: Error) => ws.send(JSON.stringify(e)));
});
