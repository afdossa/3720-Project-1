// FIX: Add a triple-slash directive to include Jest type definitions.
/// <reference types="jest" />

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // <-- FIXED THE TYPO HERE
import App from '../../App';
import * as geminiService from '../../services/geminiService';
import { MOCK_EVENTS } from '../../constants';
import { MessageSender } from '../../services/types';

// Mock the entire geminiService
jest.mock('../../services/geminiService');

const mockInitChat = geminiService.initChat as jest.Mock;
const mockSendMessage = geminiService.sendMessage as jest.Mock;
const mockConfirmBooking = geminiService.confirmBooking as jest.Mock;
const mockCancelBooking = geminiService.cancelBooking as jest.Mock;

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock fetch for event loading
    global.fetch = jest.fn((url) => {
        if (url.toString().includes('/api/events')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(MOCK_EVENTS),
            } as Response);
        }
        return Promise.resolve({ ok: false, status: 404 } as Response);
    });

    // Mock successful chat initialization
    mockInitChat.mockResolvedValue({
      sendMessage: jest.fn(),
    });
  });

  test('renders events on initial load and allows switching to chat tab', async () => {
    render(<App />);

    // Check for Events tab content
    expect(screen.getByText('Loading events...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Clemson Football Game')).toBeInTheDocument();
    });

    // Switch to Chat tab
    const chatTabButton = screen.getByText('TigerTix Assistant');
    fireEvent.click(chatTabButton);

    // Check for Chat tab content
    await waitFor(() => {
        expect(screen.getByText(/Hello! I'm the TigerTix Assistant./)).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Type or click the mic to talk...')).toBeInTheDocument();
  });

  test('user can send a message and receive a response', async () => {
    mockSendMessage.mockResolvedValue({ type: 'text', text: 'This is a mock response.' });
    
    render(<App />);
    const user = userEvent.setup();

    // Go to chat
    fireEvent.click(screen.getByText('TigerTix Assistant'));

    // Wait for chat to be ready
    const input = await screen.findByPlaceholderText('Type or click the mic to talk...');
    
    // Send a message
    await user.type(input, 'Hello Assistant');
    await user.click(screen.getByLabelText('Send message'));

    // Verify user message appears
    await waitFor(() => {
      expect(screen.getByText('Hello Assistant')).toBeInTheDocument();
    });

    // Verify mock was called
    expect(mockSendMessage).toHaveBeenCalledWith(expect.anything(), 'Hello Assistant', expect.any(Array));

    // Verify bot response appears
    await waitFor(() => {
      expect(screen.getByText('This is a mock response.')).toBeInTheDocument();
    });
  });

  test('handles booking proposal and confirmation', async () => {
    const bookingProposal = { eventName: 'Jazz Night', ticketCount: 2 };
    mockSendMessage.mockResolvedValue({
      type: 'proposal',
      text: 'Please confirm your booking.',
      proposal: bookingProposal,
    });
    mockConfirmBooking.mockResolvedValue('Booking confirmed! Enjoy the show.');

    // Mock the purchase API call
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
    });

    render(<App />);
    const user = userEvent.setup();
    
    // Go to chat
    fireEvent.click(screen.getByText('TigerTix Assistant'));
    const input = await screen.findByPlaceholderText('Type or click the mic to talk...');

    // Trigger proposal
    await user.type(input, 'Book 2 tickets for Jazz Night');
    await user.click(screen.getByLabelText('Send message'));

    // Verify proposal message and buttons appear
    await waitFor(() => {
      expect(screen.getByText('Please confirm your booking.')).toBeInTheDocument();
      expect(screen.getByText('Confirm Booking')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    // Confirm the booking
    await user.click(screen.getByText('Confirm Booking'));

    // Verify confirmation buttons disappear and confirmation message appears
    await waitFor(() => {
      expect(screen.queryByText('Confirm Booking')).not.toBeInTheDocument();
      expect(mockConfirmBooking).toHaveBeenCalledWith(expect.anything(), bookingProposal);
      expect(screen.getByText('Booking confirmed! Enjoy the show.')).toBeInTheDocument();
    });
  });
});