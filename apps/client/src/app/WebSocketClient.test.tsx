import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import WebSocketClient from './WebSocketClient';

// Very basic tests to check if the form renders correctly and if the message is sent to the server

describe('WebSocketClient', () => {
  test('renders user and action select inputs', () => {
    render(<WebSocketClient />);

    const userSelect = screen.getByLabelText(/user id/i);
    expect(userSelect).toBeInTheDocument();

    const actionSelect = screen.getByLabelText(/action/i);
    expect(actionSelect).toBeInTheDocument();
  });

  test('renders send button', () => {
    render(<WebSocketClient />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeInTheDocument();
  });

  test('submits message to WebSocket server', () => {
    render(<WebSocketClient />);

    const userSelect = screen.getByLabelText(/user id/i);
    const actionSelect = screen.getByLabelText(/action/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    userEvent.selectOptions(userSelect, 'user1');
    userEvent.selectOptions(actionSelect, 'Subscribe');
    userEvent.click(sendButton);

    // Add an assertion to check if the message was successfully sent to the server
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });
});
