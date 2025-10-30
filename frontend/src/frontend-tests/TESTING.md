# TigerTix Testing Strategy - Sprint 2

This document outlines the testing strategy for the TigerTix application, focusing on the new LLM-driven booking and voice interface features introduced in Sprint 2. Our approach combines automated and manual testing to ensure application robustness, reliability, and accessibility.

## 1. Testing Approach

Our strategy is divided into three layers:

1.  **Unit Tests**: To verify that individual components and functions work correctly in isolation. We use Jest and React Testing Library for the frontend and Jest for backend services.
2.  **Integration Tests**: To ensure that different parts of the application (e.g., components, services, and API mocks) work together as expected.
3.  **End-to-End (E2E) & Manual Tests**: To validate complete user flows from the user's perspective. This is crucial for features like voice interaction and accessibility that are difficult to automate fully.

## 2. Automated Testing

Automated tests are written for critical application logic to catch regressions and validate functionality quickly.

### Frontend (React Testing Library + Jest)

-   **`geminiService.ts` (Unit Tests)**:
    -   **Test Case**: `initChat` initializes the chat session correctly.
        -   **Expected Result**: The `@google/genai` library is called with the correct model name, system instructions, and tools.
    -   **Test Case**: `sendMessage` correctly handles a standard text message.
        -   **Expected Result**: The message is sent to the chat API, and the text response is returned.
    -   **Test Case**: `sendMessage` correctly handles a function call for `list_events`.
        -   **Expected Result**: The service sends the initial message, receives a function call, and then sends the correct function response back to the API.
    -   **Test Case**: `sendMessage` correctly handles a function call for `propose_booking`.
        -   **Expected Result**: The service returns a structured `proposal` object to be handled by the UI.

-   **`ChatInput.tsx` (Component Tests)**:
    -   **Test Case**: Component renders correctly with a text input, send button, and mic button.
    -   **Test Case**: Typing in the input field updates its value.
    -   **Test Case**: Send button is disabled when the input is empty or when the chat is not ready.
    -   **Test Case**: Clicking "Send" calls the `onSendMessage` prop with the correct text.
    -   **Test Case**: Clicking the microphone button initiates the (mocked) Web Speech API.
    -   **Test Case**: When the mocked Speech API returns a transcript, the input value is updated.

-   **`ChatMessage.tsx` (Component Tests)**:
    -   **Test Case**: Renders a user message with the correct text and styles.
    -   **Test Case**: Renders a bot message with the correct text and styles.
    -   **Test Case**: When a `bookingProposal` is present, it renders "Confirm Booking" and "Cancel" buttons.
    -   **Test Case**: Clicking "Confirm Booking" calls the `onConfirm` prop.
    -   **Test Case**: Clicking "Cancel" calls the `onCancel` prop.

-   **`App.tsx` (Integration Tests)**:
    -   **Test Case**: App renders, fetches events from the (mocked) API, and displays them.
    -   **Test Case**: User can switch between the "Events" and "TigerTix Assistant" tabs.
    -   **Test Case**: User can send a message in the chat, and both the user's message and the bot's (mocked) response appear in the chat history.
    -   **Test Case**: Simulating a booking proposal from the bot correctly displays confirmation buttons, and clicking them triggers the appropriate handler.

## 3. Manual Testing

Manual tests are executed to cover scenarios that are complex or impossible to automate reliably.

-   **LLM-Driven Booking (Text)**
    -   **Test Case**: Type "show me the events" into the chat.
        -   **Expected Result**: The assistant responds with a formatted list of all available events.
    -   **Test Case**: Type "I want to buy 2 tickets for Jazz Night".
        -   **Expected Result**: The assistant presents a confirmation prompt with "Confirm Booking" and "Cancel" buttons. Clicking "Confirm" successfully completes the purchase and updates the event list.
    -   **Test Case**: Attempt to book more tickets than are available.
        -   **Expected Result**: An error message is displayed, and the booking does not proceed.

-   **Voice-Enabled Interface**
    -   **Test Case**: Click the microphone button.
        -   **Expected Result**: A beep sound is played, and the browser's permission prompt for microphone access appears (if not already granted). The icon indicates recording is active.
    -   **Test Case**: Speak a command like "list available events".
        -   **Expected Result**: The transcribed text appears in the input field. The assistant processes the request and speaks the response out loud.
    -   **Test Case**: Speak a booking request like "Get me one ticket for the football game".
        -   **Expected Result**: The booking proposal appears, and the assistant's proposal text is spoken aloud.

-   **Accessibility (A11y)**
    -   **Test Case**: Navigate the entire application using only the Tab key.
        -   **Expected Result**: All interactive elements (tabs, buttons, inputs, event list items) are focusable in a logical order. A clear focus indicator is always visible.
    -   **Test Case**: Use a screen reader (e.g., NVDA, VoiceOver) to navigate the application.
        -   **Expected Result**: The screen reader correctly announces all elements, including ARIA labels for buttons and roles for different sections. The chat history is read out correctly.

-   **Database and Concurrency**
    -   **Test Case**: Open two browser windows and attempt to purchase the last available ticket for an event simultaneously.
        -   **Expected Result**: Only one of the two purchase requests succeeds. The other receives an error message indicating the event is sold out. The database correctly reflects that zero tickets are available.

## 4. Bug Reporting

-   **Bug Found**: In development, the initial welcome message appears twice.
    -   **Cause**: React's `StrictMode` intentionally double-invokes `useEffect` to detect side effects.
    -   **Resolution**: Implemented a `useRef` guard to ensure the initialization logic runs only once on component mount.
-   **Edge Case**: User drags an event to the chat tab but drops it outside the tab button.
    -   **Result**: The action is ignored, and the UI state remains unchanged. This is acceptable behavior.