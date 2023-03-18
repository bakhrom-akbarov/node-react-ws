import React, { useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';

type WebSocketRef = {
  current: WebSocket | null;
};

type Message = {
  type: 'Subscribe' | 'Unsubscribe' | 'CountSubscribers' | 'Error';
  updatedAt?: number;
  status?: 'Subscribed' | 'Unsubscribed';
  error?: string;
  userId?: string;
};

function WebSocketClient() {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const ws: WebSocketRef = useRef<WebSocket | null>(null);


  useEffect(() => {
    // Connect to the WebSocket server
    ws.current = new WebSocket(`ws://localhost:${import.meta.env.VITE_APP_API_PORT}`);

    // Set up event listeners
    ws.current.addEventListener('open', () => {
      console.log('WebSocket connection established');
    });

    ws.current.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    // Clean up the WebSocket connection on unmount
    return () => {
      ws?.current?.close();
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Send a message to the WebSocket server
    const message = {
      type: action,
      userId
    };
    ws.current.send(JSON.stringify(message));

    // Reset the form inputs
    setUserId('');
    setAction('');
  };

  return (
    <div>
      <h1>WebSocket Client</h1>
      <h5>Your username: user1</h5>
      <form onSubmit={handleSubmit}>
        <label>
          User ID:
          <select
            className="form-select"
            id="userId"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            required
          >
            <option value="">-- Select a user --</option>
            <option value="user1">User 1</option>
            <option value="user2">User 2</option>
            <option value="user3">User 3</option>
          </select>
        </label>
        <br />
        <br />
        <label>
          Action:
          <select
            className="form-select"
            id="action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
            required
          >
            <option value="">-- Select an action --</option>
            <option value="Subscribe">Subscribe</option>
            <option value="Unsubscribe">Unsubscribe</option>
            <option value="CountSubscribers">Count Subscribers</option>
          </select>
        </label>
        <br />
        <br />
        <Button type="submit">Send</Button>
      </form>
      <hr />
      <div style={{ height: '200px', overflow: 'auto' }}>
        {messages.map((message: Message, index) => (
          <div key={index}>
            {message.type}: {JSON.stringify(message)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WebSocketClient;
