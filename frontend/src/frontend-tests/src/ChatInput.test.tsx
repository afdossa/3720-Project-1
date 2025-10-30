/// <reference types="jest" />

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../../components/ChatInput.tsx';

describe('ChatInput Component', () => {
  const mockOnSendMessage = jest.fn();
  const mockOnChange = jest.fn();

  const defaultProps = {
    onSendMessage: mockOnSendMessage,
    onChange: mockOnChange,
    isLoading: false,
    isChatReady: true,
    value: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input, send button, and mic button', () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('Type or click the mic to talk...')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
    expect(screen.getByLabelText('Start recording')).toBeInTheDocument();
  });

  test('updates input value on change', async () => {
    render(<ChatInput {...defaultProps} value="initial" />);
    const input = screen.getByPlaceholderText('Type or click the mic to talk...');

    await userEvent.type(input, ' text');

    expect(mockOnChange).toHaveBeenCalledWith('initial text');
  });

  test('send button is disabled when input is empty', () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByLabelText('Send message')).toBeDisabled();
  });

  test('send button is enabled when input has text', () => {
    render(<ChatInput {...defaultProps} value="Hello" />);
    expect(screen.getByLabelText('Send message')).toBeEnabled();
  });

  test('calls onSendMessage on form submit', async () => {
    render(<ChatInput {...defaultProps} value="Test message" />);

    await userEvent.click(screen.getByLabelText('Send message'));

    expect(mockOnSendMessage).toHaveBeenCalledTimes(1);
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  test('all controls are disabled when isLoading is true', () => {
    render(<ChatInput {...defaultProps} isLoading={true} value="some text" />);

    expect(screen.getByPlaceholderText('Type or click the mic to talk...')).toBeDisabled();
    expect(screen.getByLabelText('Send message')).toBeDisabled();
    expect(screen.getByLabelText('Start recording')).toBeDisabled();
  });

  test('controls are disabled when chat is not ready', () => {
    render(<ChatInput {...defaultProps} isChatReady={false} value="some text" />);

    expect(screen.getByPlaceholderText('Assistant is offline...')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeDisabled();
    expect(screen.getByLabelText('Start recording')).toBeDisabled();
  });

  test('microphone button click starts recognition', async () => {
    render(<ChatInput {...defaultProps} />);
    const micButton = screen.getByLabelText('Start recording');

    await userEvent.click(micButton);

    const recognitionInstance = (window.SpeechRecognition as jest.Mock).mock.results[0].value;
    expect(recognitionInstance.start).toHaveBeenCalledTimes(1);
  });

  test('updates input with speech recognition result', () => {
    render(<ChatInput {...defaultProps} />);
    const recognitionInstance = (window.SpeechRecognition as jest.Mock).mock.results[0].value;

    const mockResultEvent = {
      results: [[{ transcript: 'Voice input test' }]],
    };
    recognitionInstance.onresult(mockResultEvent);

    expect(mockOnChange).toHaveBeenCalledWith('Voice input test');
  });
});