
import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import type { ChatMessage as ChatMessageType, BookingProposal, Event } from './types.ts';

// Import services and components
import { initChat, sendMessage, confirmBooking, cancelBooking } from './services/geminiService.ts';
import ChatMessage from './components/ChatMessage.tsx';
import ChatInput from './components/ChatInput.tsx';
import { MessageSender } from './types.ts';

const API_BASE_URL = 'http://localhost:6001/api';

function App() {
    // --- State for Event Listing (Largely Unchanged) ---
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for the new integrated Chat ---
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    const fetchEvents = useCallback(async () => {
        setIsLoadingEvents(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/events`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEvents(data);
            return data;
        } catch (err: any) {
            console.error('Error fetching events:', err);
            setError('Failed to load events.');
            return [];
        } finally {
            setIsLoadingEvents(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Initialize Chat on component mount
    useEffect(() => {
        const initializeChat = async () => {
            try {
                const chatSession = await initChat();
                setChat(chatSession);
                addMessage(
                    MessageSender.BOT,
                    "Hello! I'm TigerTix Bot. You can ask me to list events or book tickets."
                );
            } catch (e) {
                console.error("Failed to initialize Gemini chat:", e);
                addMessage(
                    MessageSender.BOT,
                    "Sorry, I couldn't connect to the AI assistant. Please check your API key configuration."
                );
            }
        };
        initializeChat();
    }, []);


    // A silent purchase function that doesn't interact with chat state directly.
    const purchaseSingleTicket = async (id: number): Promise<{ success: boolean; message?: string }> => {
        const endpoint = `${API_BASE_URL}/events/${id}/purchase`;
        try {
            const response = await fetch(endpoint, { method: 'POST' });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const errorMessage = data.message || 'Unable to purchase ticket. It might be sold out.';
                return { success: false, message: errorMessage };
            }
            return { success: true };
        } catch (err) {
            console.error('Error purchasing single ticket:', err);
            return { success: false, message: 'An unexpected network error occurred during purchase.' };
        }
    };


    const renderContent = () => {
        if (isLoadingEvents) return <p>Loading events...</p>;
        if (error) return <p className="error-message">{error}</p>;
        if (events.length === 0) return <p>No events available at this time.</p>;

        return (
            <ul className="event-list">
                {events.map((event) => {
                    const isSoldOut = event.tickets_available === 0;
                    return (
                        <li key={event.id} className="event-item">
                            <div className="event-info">
                                <strong>{event.name}</strong> - {event.date}
                                <span className="ticket-count">{event.tickets_available} left</span>
                            </div>
                            <button
                                className={`buy-button ${isSoldOut ? 'sold-out' : ''}`}
                                disabled={isSoldOut}
                                onClick={() => handleSendMessage(`I want to buy a ticket for ${event.name}`)}
                            >
                                {isSoldOut ? 'Sold Out' : 'Buy Ticket'}
                            </button>
                        </li>
                    );
                })}
            </ul>
        );
    };

    const addMessage = (sender: MessageSender, text: string, bookingProposal?: BookingProposal) => {
        setChatMessages(prev => [
            ...prev,
            { id: Date.now().toString() + Math.random(), sender, text, bookingProposal }
        ]);
    };

    const handleSendMessage = async (messageText: string) => {
        if (isChatLoading || !chat) return;

        addMessage(MessageSender.USER, messageText);
        setIsChatLoading(true);

        try {
            const response = await sendMessage(chat, messageText, events);
            addMessage(MessageSender.BOT, response.text, response.type === 'proposal' ? response.proposal : undefined);
        } catch (err) {
            console.error("Error sending message:", err);
            addMessage(MessageSender.BOT, "Sorry, I encountered an error. Please try again.");
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleConfirm = async (proposal: BookingProposal) => {
        const eventToBook = events.find(e => e.name.toLowerCase() === proposal.eventName.toLowerCase());

        if (!eventToBook) {
            addMessage(MessageSender.BOT, `Sorry, I couldn't find an event named "${proposal.eventName}".`);
            return;
        }

        if (eventToBook.tickets_available < proposal.ticketCount) {
             addMessage(MessageSender.BOT, `Sorry, there are not enough tickets available for "${proposal.eventName}". Only ${eventToBook.tickets_available} left.`);
             return;
        }

        setChatMessages(prev => prev.map(msg => msg.bookingProposal ? { ...msg, bookingProposal: undefined } : msg));

        let ticketsPurchased = 0;
        let purchaseFailed = false;
        let failureMessage = '';

        for (let i = 0; i < proposal.ticketCount; i++) {
            const result = await purchaseSingleTicket(eventToBook.id);
            if (result.success) {
                ticketsPurchased++;
            } else {
                purchaseFailed = true;
                failureMessage = result.message || 'An unknown error occurred.';
                break;
            }
        }

        await fetchEvents();

        if (purchaseFailed) {
            addMessage(MessageSender.BOT, `I was only able to purchase ${ticketsPurchased} ticket(s) for "${proposal.eventName}". The booking failed: ${failureMessage}`);
            return;
        }
        
        if (ticketsPurchased > 0 && chat) {
            const confirmationText = await confirmBooking(chat, proposal);
            addMessage(MessageSender.BOT, confirmationText);
        }
    };

    const handleCancel = async (proposal: BookingProposal) => {
        setChatMessages(prev => prev.map(msg => msg.bookingProposal ? { ...msg, bookingProposal: undefined } : msg));

        if (chat) {
            const cancellationText = await cancelBooking(chat, proposal);
            addMessage(MessageSender.BOT, cancellationText);
        }
    };

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    return (
        <div className="App">
            <style>{`
                /* --- Main App and Event Styles (from original) --- */
                .App {
                    font-family: 'Arial', sans-serif;
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    background-color: #ffffff;
                }
                h1 {
                    color: #522583; /* Clemson Purple */
                    text-align: center;
                    margin-bottom: 25px;
                    border-bottom: 2px solid #f66733; /* Clemson Orange accent */
                    padding-bottom: 10px;
                }
                 h3 {
                    color: #522583;
                    text-align: center;
                    margin-bottom: 10px;
                }
                .error-message {
                    color: red;
                    text-align: center;
                    padding: 15px;
                    background-color: #fee;
                    border-radius: 8px;
                }
                .event-list { list-style: none; padding: 0; }
                .event-item {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 15px; margin-bottom: 10px; border: 1px solid #eee;
                    border-radius: 8px; background-color: #f9f9f9;
                }
                .event-info { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 5px; 
                    color: #000000; /* Make event info text black */
                }
                .ticket-count { font-size: 0.9em; color: #f66733; font-weight: bold; }
                .buy-button {
                    padding: 8px 15px; border: none; border-radius: 6px; cursor: pointer;
                    font-weight: bold; transition: background-color 0.3s, opacity 0.3s;
                    background-color: #522583; color: white;
                }
                .buy-button:hover:not(:disabled) { background-color: #6a3e9c; }
                .buy-button:disabled {
                    background-color: #cccccc; color: #666666; cursor: not-allowed; opacity: 0.7;
                }
                 .buy-button.sold-out {
                    background-color: #f0f0f0; color: #999999; border: 1px solid #ccc;
                }

                /* --- Chat Styles --- */
                .separator {
                    border: none; border-top: 2px solid #f66733; margin: 30px 0;
                }
                .chat-area-container {
                    display: flex; flex-direction: column; gap: 15px;
                }
                .chat-box {
                    height: 400px;
                    overflow-y: auto;
                    border: 1px solid #eee;
                    padding: 15px;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                @media (max-width: 650px) {
                    .App { margin: 20px; padding: 15px; }
                    .event-item { flex-direction: column; align-items: flex-start; gap: 10px; }
                    .buy-button { width: 100%; }
                }
            `}</style>
            <h1>Clemson Campus Events</h1>
            {renderContent()}

            <hr className="separator" />

            <div className="chat-area-container">
                <h3>TigerTix Assistant</h3>
                <div className="chat-box">
                    {chatMessages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            message={msg}
                            onConfirm={handleConfirm}
                            onCancel={handleCancel}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <ChatInput onSendMessage={handleSendMessage} isLoading={isChatLoading} />
            </div>
        </div>
    );
}

export default App;
