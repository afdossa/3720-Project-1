if (typeof expect !== 'undefined') {
  // This library relies on the global 'expect' being defined.
  // We use require() inside a condition to prevent crashing when executed outside Jest.
  require('@testing-library/jest-dom');
}

// Check if the Jest environment is loaded before attempting to use jest.fn().
if (typeof jest !== 'undefined') {
  global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
  ) as jest.Mock;

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
}

// This environment variable definition is safe to run outside the Jest check.
process.env.API_KEY = 'mock-api-key';
