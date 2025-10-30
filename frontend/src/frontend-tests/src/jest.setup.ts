// FIX: Add a triple-slash directive to include Jest type definitions.
/// <reference types="jest" />

import '@testing-library/jest-dom';

// Mock the global fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

// Mock the Web Speech API for ChatInput tests
global.window.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  continuous: false,
  lang: 'en-US',
  interimResults: false,
  onresult: jest.fn(),
  onend: jest.fn(),
  onerror: jest.fn(),
}));

global.window.webkitSpeechRecognition = global.window.SpeechRecognition;

// Mock the AudioContext API for ChatInput tests
global.window.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: () => ({
    connect: jest.fn(),
    frequency: { value: 0 },
    type: 'sine',
    start: jest.fn(),
    stop: jest.fn(),
  }),
  createGain: () => ({
    connect: jest.fn(),
    gain: { value: 0 },
  }),
  destination: {},
  close: jest.fn(),
}));

// Mock process.env for geminiService tests
process.env.API_KEY = 'mock-api-key';