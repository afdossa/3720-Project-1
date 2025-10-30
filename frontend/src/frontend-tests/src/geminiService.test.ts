import { GoogleGenAI, Chat, FunctionCall } from '@google/genai';
import { initChat, sendMessage, confirmBooking, cancelBooking } from '../../services/geminiService.ts';
import { MOCK_EVENTS } from '../../../../../../../../Downloads/clemson-campus-events-&-assistant (5)/src/constants.ts';

jest.mock('@google/genai');

const MockedGoogleGenAI = GoogleGenAI as jest.Mock;

describe('geminiService', () => {
    let mockSendMessage: jest.Mock;
    let mockCreateChat: jest.Mock;
    let mockChat: Chat;

    beforeEach(() => {
        jest.clearAllMocks();

        mockSendMessage = jest.fn();
        mockCreateChat = jest.fn().mockReturnValue({
            sendMessage: mockSendMessage,
        });

        mockChat = {
            sendMessage: mockSendMessage,
        } as unknown as Chat;

        MockedGoogleGenAI.mockImplementation(() => {
            return {
                chats: {
                    create: mockCreateChat,
                },
            };
        });
    });

    describe('initChat', () => {
        it('should initialize a chat session with the correct model and tools', async () => {
            await initChat();
            expect(mockCreateChat).toHaveBeenCalledWith({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: expect.any(String),
                    tools: [{ functionDeclarations: expect.any(Array) }],
                },
            });
        });
    });

    describe('sendMessage', () => {
        it('should send a simple text message and return a text response', async () => {
            mockSendMessage.mockResolvedValue({ text: 'Hello there!' });

            const response = await sendMessage(mockChat, 'Hi', MOCK_EVENTS);

            expect(mockSendMessage).toHaveBeenCalledWith({ message: 'Hi' });
            expect(response).toEqual({ type: 'text', text: 'Hello there!' });
        });

        it('should handle a list_events function call', async () => {
            const listEventsCall: FunctionCall = { name: 'list_events', args: {} };
            mockSendMessage
                .mockResolvedValueOnce({ functionCalls: [listEventsCall] })
                .mockResolvedValueOnce({ text: 'Here are the events.' });

            const response = await sendMessage(mockChat, 'Show events', MOCK_EVENTS);

            expect(mockSendMessage).toHaveBeenCalledWith({ message: 'Show events' });
            expect(mockSendMessage).toHaveBeenCalledWith({
                message: [
                    {
                        functionResponse: {
                            name: 'list_events',
                            response: { result: expect.stringContaining('Clemson Football Game') },
                        },
                    },
                ],
            });
            expect(response).toEqual({ type: 'text', text: 'Here are the events.' });
        });

        it('should handle a propose_booking function call and return a proposal response', async () => {
            const proposeBookingCall: FunctionCall = {
                name: 'propose_booking',
                args: { eventName: 'Jazz Night', ticketCount: 2 },
            };
            mockSendMessage.mockResolvedValue({ functionCalls: [proposeBookingCall] });

            const response = await sendMessage(mockChat, 'Book 2 for Jazz', MOCK_EVENTS);

            expect(mockSendMessage).toHaveBeenCalledWith({ message: 'Book 2 for Jazz' });
            expect(response).toEqual({
                type: 'proposal',
                text: expect.any(String),
                proposal: { eventName: 'Jazz Night', ticketCount: 2 },
            });
        });
    });

    describe('confirmBooking', () => {
        it('should send a confirmation function response', async () => {
            const proposal = { eventName: 'Test Event', ticketCount: 1 };
            mockSendMessage.mockResolvedValue({ text: 'Confirmed!' });

            const response = await confirmBooking(mockChat, proposal);

            expect(mockSendMessage).toHaveBeenCalledWith({ message: [
                    {
                        functionResponse: {
                            name: 'propose_booking',
                            response: { result: `Booking confirmed by user for 1 tickets to Test Event.` }
                        }
                    }
                ]});
            expect(response).toBe('Confirmed!');
        });
    });

    describe('cancelBooking', () => {
        it('should send a cancellation function response', async () => {
            const proposal = { eventName: 'Test Event', ticketCount: 1 };
            mockSendMessage.mockResolvedValue({ text: 'Cancelled.' });

            const response = await cancelBooking(mockChat, proposal);

            expect(mockSendMessage).toHaveBeenCalledWith({ message: [
                    {
                        functionResponse: {
                            name: 'propose_booking',
                            response: { result: `Booking cancelled by user for 1 tickets to Test Event.` }
                        }
                    }
                ]});
            expect(response).toBe('Cancelled.');
        });
    });
});
