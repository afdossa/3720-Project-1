/// <reference types="jest" />

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
// Note: We need to import the custom matchers if we can't install them globally.
// Since we can't install, we'll use alternative assertions below.

import { ChatMessage } from '../../components/ChatMessage.tsx';
import { MessageSender, type ChatMessage as ChatMessageType, BookingProposal } from '../../../../../../../../Downloads/clemson-campus-events-&-assistant (5)/src/types.ts';

describe('ChatMessage Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const userMessage: ChatMessageType = {
    id: '1',
    sender: MessageSender.USER,
    text: 'Hello, I am a user.',
  };

  const botMessage: ChatMessageType = {
    id: '2',
    sender: MessageSender.BOT,
    text: 'Hello, I am a bot.',
  };

  const bookingProposal: BookingProposal = {
    eventName: 'Test Event',
    ticketCount: 2,
  };

  const botMessageWithProposal: ChatMessageType = {
    id: '3',
    sender: MessageSender.BOT,
    text: 'Please confirm your booking.',
    bookingProposal: bookingProposal,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user message correctly', () => {
    render(<ChatMessage message={userMessage} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    const messageBubble = screen.getByText(userMessage.text).parentElement;
    // FIX 1 (from previous issue): Replaced toHaveClass with .className and .toContain
    expect(messageBubble.className).toContain('message-bubble');
    expect(messageBubble.className).toContain('user');

    // FIX 2: Replaced not.toBeInTheDocument with toBeNull (since queryByText returns null if not found)
    expect(screen.queryByText('Confirm Booking')).toBeNull();
  });

  test('renders bot message correctly', () => {
    render(<ChatMessage message={botMessage} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    const messageBubble = screen.getByText(botMessage.text).parentElement;
    // FIX 1 (from previous issue): Replaced toHaveClass with .className and .toContain
    expect(messageBubble.className).toContain('message-bubble');
    expect(messageBubble.className).toContain('bot');

    // FIX 2: Replaced not.toBeInTheDocument with toBeNull
    expect(screen.queryByText('Confirm Booking')).toBeNull();
  });

  test('renders bot message with booking proposal and confirmation buttons', () => {
    render(<ChatMessage message={botMessageWithProposal} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    // FIX 2: Replaced toBeInTheDocument with the standard toBeTruthy (since getByText throws if not found)
    expect(screen.getByText('Please confirm your booking.')).toBeTruthy();
    expect(screen.getByText('Confirm Booking')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  test('calls onConfirm when the confirm button is clicked', () => {
    render(<ChatMessage message={botMessageWithProposal} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Confirm Booking'));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith(bookingProposal);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  test('calls onCancel when the cancel button is clicked', () => {
    render(<ChatMessage message={botMessageWithProposal} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).toHaveBeenCalledWith(bookingProposal);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});