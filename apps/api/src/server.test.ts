// Here is the test for the WebSocket server. This test suite contains very basic tests. In a real life project, we would have more tests to cover all the edge cases.
import WebSocket from "ws";
import { Application } from 'express';
import { server as app } from "./server";

jest.setTimeout(20000);

describe("WebSocket Server", () => {
  let ws: WebSocket;
  let server: ReturnType<Application['listen']> | undefined;

  beforeEach((done) => {
    server = app.listen(process.env.VITE_APP_API_PORT || 3001, () => {
      ws = new WebSocket(`ws://localhost:${process.env.VITE_APP_API_PORT}/api`);
      ws.on("open", () => done());
    });
  });

  afterEach((done) => {
    ws.on("close", () => {
      server.close(() => done());
    });
    ws.close();
  });

  it("should allow a client to subscribe to a user", (done) => {
    const message = { type: "Subscribe", userId: "user2" };
    ws.send(JSON.stringify(message));

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type !== "Heartbeat") {
        expect(message.type).toEqual("Subscribe");
        expect(message.status).toEqual("Subscribed");
        done();
      }
    });
  });

  it("should allow a client to unsubscribe from a user", (done) => {
    const unsubscribeMessage = { type: "Unsubscribe", userId: "user2" };
    ws.send(JSON.stringify(unsubscribeMessage));

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type !== "Heartbeat") {
        expect(message.type).toEqual("Unsubscribe");
        expect(message.status).toEqual("Unsubscribed");
        done();
      }
    });
  });

  it("should allow a client to count the number of subscribers for a user", (done) => {
    const countSubscribersMessage = {
      type: "CountSubscribers",
      userId: "user1",
    };
    ws.send(JSON.stringify(countSubscribersMessage));

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type !== "Heartbeat") {
        expect(message.type).toEqual("CountSubscribers");
        expect(message.count).toEqual(0);
        done();
      }
    });
  });
});
