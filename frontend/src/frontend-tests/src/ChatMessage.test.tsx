// FIX: Add a triple-slash directive to include Jest type definitions.
/// <reference types="jest" />

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(messageBubble).toHaveClass('message-bubble user');
    expect(screen.queryByText('Confirm Booking')).not.toBeInTheDocument();
  });

  test('renders bot message correctly', () => {
    render(<ChatMessage message={botMessage} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    
    const messageBubble = screen.getByText(botMessage.text).parentElement;
    expect(messageBubble).toHaveClass('message-bubble bot');
    expect(screen.queryByText('Confirm Booking')).not.toBeInTheDocument();
  });

  test('renders bot message with booking proposal and confirmation buttons', () => {
    render(<ChatMessage message={botMessageWithProposal} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    
    expect(screen.getByText('Please confirm your booking.')).toBeInTheDocument();
    expect(screen.getByText('Confirm Booking')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
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