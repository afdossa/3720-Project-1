import React, { useEffect, useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:6001/api';

function App() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // fetchEvents now returns the data it fetched, allowing buyTicket to use the fresh list.
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/events`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEvents(data);
            return data; // Return data for use in buyTicket
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events.');
            return []; // Return empty array on failure
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const buyTicket = async (id, name) => {
        const endpoint = `${API_BASE_URL}/events/${id}/purchase`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
            });

            let data = {};
            try {
                // Safely attempt to parse the JSON response body (even though we know it's missing the count)
                data = await response.json();
            } catch (e) {
                console.warn("Response body could not be parsed as JSON. Treating as empty object.", e);
            }

            if (response.ok) {
                // FIX: Server response doesn't contain the count, so we immediately fetch the new list.
                const newEventsList = await fetchEvents();

                // Find the specific event in the freshly fetched list to get the actual remaining count.
                const updatedEvent = newEventsList.find(e => e.id === id);

                const remainingText = updatedEvent?.tickets_available ?? 'Unknown (Check list refresh)';

                alert(`Ticket purchased for: ${name}\nRemaining: ${remainingText}`);

                // Note: The UI is updated by the fetchEvents call above, but we keep the alert synchronized.
            } else {
                const errorMessage = data.message || 'Unable to purchase ticket. Please try again.';
                alert(errorMessage);
            }
        } catch (err) {
            console.error('Error purchasing ticket:', err);
            alert('An unexpected error occurred while purchasing the ticket.');
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <p>Loading events...</p>;
        }
        if (error) {
            return <p className="error-message">{error}</p>;
        }
        if (events.length === 0) {
            return <p>No events available at this time.</p>;
        }

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
                                onClick={() => buyTicket(event.id, event.name)}
                            >
                                {isSoldOut ? 'Sold Out' : 'Buy Ticket'}
                            </button>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="App">
            <style jsx="true">{`
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
                .error-message {
                    color: red;
                    text-align: center;
                    padding: 15px;
                    background-color: #fee;
                    border-radius: 8px;
                }
                .event-list {
                    list-style: none;
                    padding: 0;
                }
                .event-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    margin-bottom: 10px;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                }
                .event-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .ticket-count {
                    font-size: 0.9em;
                    color: #f66733;
                    font-weight: bold;
                }
                .buy-button {
                    padding: 8px 15px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background-color 0.3s, opacity 0.3s;
                    background-color: #522583;
                    color: white;
                }
                .buy-button:hover:not(:disabled) {
                    background-color: #6a3e9c;
                }
                .buy-button:disabled {
                    background-color: #cccccc;
                    color: #666666;
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                .buy-button.sold-out {
                    background-color: #f0f0f0;
                    color: #999999;
                    border: 1px solid #ccc;
                }

                /* Responsive adjustments */
                @media (max-width: 650px) {
                    .App {
                        margin: 20px;
                        padding: 15px;
                    }
                    .event-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }
                    .buy-button {
                        width: 100%;
                    }
                }
            `}</style>
            <h1>Clemson Campus Events</h1>
            {renderContent()}
        </div>
    );
}

export default App;
