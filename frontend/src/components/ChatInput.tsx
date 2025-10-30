import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, MicrophoneIcon } from './Icons.tsx';

// Add this to handle vendor prefixes for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, value, onChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isApiSupported, setIsApiSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsApiSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsApiSupported(false);
    }
  }, [onChange]);

  const playBeep = () => {
    // Ensure AudioContext is available, also checking for webkit prefix
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.value = 0.1;
    oscillator.frequency.value = 880; // A5 note
    oscillator.type = 'sine';

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 150);
  };

  const handleMicClick = () => {
    if (isLoading || !isApiSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      playBeep();
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSendMessage(value);
    }
  };

  return (
    <>
      <style>{`
        .chat-input-form {
            display: flex;
            gap: 10px;
            flex-shrink: 0;
        }
        .chat-input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 1rem;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .chat-input:focus {
            outline: none;
            border-color: #522583;
            box-shadow: 0 0 0 2px rgba(82, 37, 131, 0.2);
        }
        .chat-input:disabled {
            background-color: #f0f0f0;
            cursor: not-allowed;
        }
        .send-button, .mic-button {
            padding: 10px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .send-button {
            background-color: #522583;
            color: white;
            padding: 10px 15px;
        }
        .send-button:hover:not(:disabled) {
            background-color: #6a3e9c;
        }
        .send-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .mic-button {
            background-color: #f0f0f0;
            color: #522583;
        }
        .mic-button:hover:not(:disabled) {
            background-color: #e0e0e0;
        }
        .mic-button:disabled {
            background-color: #cccccc;
            color: #999;
            cursor: not-allowed;
        }
        .mic-button.recording {
            color: #dc3545; /* Red */
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
          }
        }
      `}</style>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type or click the mic to talk..."
          disabled={isLoading}
          className="chat-input"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isLoading || !isApiSupported}
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          title={isApiSupported ? 'Use microphone' : 'Voice input not supported by your browser'}
        >
          <MicrophoneIcon style={{ width: '24px', height: '24px' }} />
        </button>
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="send-button"
          aria-label="Send message"
        >
          <SendIcon style={{ width: '24px', height: '24px' }} />
        </button>
      </form>
    </>
  );
};

export default ChatInput;