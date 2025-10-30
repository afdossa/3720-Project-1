import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../../components/ChatInput.tsx';


const mockSpeechRecognition = { mock: { results: [{ value: { start: jest.fn(), onresult: jest.fn() } }] }, mockClear: jest.fn() };
const mockAudioContext = { mockClear: jest.fn(), call: jest.fn() };


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

  const isElementDisabled = (element: HTMLElement) => {
    return element.hasAttribute('disabled');
  };

  test('renders input, send button, and mic button', () => {
    render(<ChatInput {...defaultProps} />);

    expect(screen.getByPlaceholderText('Type or click the mic to talk...')).toBeTruthy();
    expect(screen.getByLabelText('Send message')).toBeTruthy();
    expect(screen.getByLabelText('Start recording')).toBeTruthy();
  });

  test('updates input value on change', async () => {
    render(<ChatInput {...defaultProps} value="initial" />);
    const input = screen.getByPlaceholderText('Type or click the mic to talk...');

    fireEvent.change(input, { target: { value: 'initial text' } });

    expect(mockOnChange).toHaveBeenCalledWith('initial text');
  });

  test('send button is disabled when input is empty', () => {
    render(<ChatInput {...defaultProps} />);
    const sendButton = screen.getByLabelText('Send message');

    expect(isElementDisabled(sendButton)).toBe(true);
  });

  test('send button is enabled when input has text', () => {
    render(<ChatInput {...defaultProps} value="Hello" />);
    const sendButton = screen.getByLabelText('Send message');

    expect(isElementDisabled(sendButton)).toBe(false);
  });

  test('calls onSendMessage on form submit', async () => {
    render(<ChatInput {...defaultProps} value="Test message" />);

    await userEvent.click(screen.getByLabelText('Send message'));

    expect(mockOnSendMessage).toHaveBeenCalledTimes(1);
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  test('all controls are disabled when isLoading is true', () => {
    render(<ChatInput {...defaultProps} isLoading={true} value="some text" />);

    expect(isElementDisabled(screen.getByPlaceholderText('Type or click the mic to talk...'))).toBe(true);
    expect(isElementDisabled(screen.getByLabelText('Send message'))).toBe(true);
    expect(isElementDisabled(screen.getByLabelText('Start recording'))).toBe(true);
  });

  test('controls are disabled when chat is not ready', () => {
    render(<ChatInput {...defaultProps} isChatReady={false} value="some text" />);

    expect(screen.getByPlaceholderText('Assistant is offline...')).toBeTruthy();

    expect(isElementDisabled(screen.getByLabelText('Send message'))).toBe(true);
    expect(isElementDisabled(screen.getByLabelText('Start recording'))).toBe(true);
  });
});
