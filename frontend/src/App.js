import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [events, setEvents] = useState([]);

    const fetchEvents = () => {
        fetch('http://localhost:6001/api/events')
            .then((res) => res.json())
            .then((data) => setEvents(data))
            .catch((err) => console.error('Error fetching events:', err));
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const buyTicket = async (id, name) => {
        try {
            const res = await fetch(`http://localhost:6001/api/events/${id}/buy`, {
                method: 'PATCH',
            });
            const data = await res.json();

            if (res.ok) {
                alert(`Ticket purchased for: ${name}\nRemaining: ${data.tickets_remaining}`);
                fetchEvents();
            } else {
                alert(data.message || 'Unable to purchase ticket.');
            }
        } catch (err) {
            console.error(err);
            alert('Error purchasing ticket.');
        }
    };

    return (
        <div className="App">
            <h1>Clemson Campus Events</h1>
            {events.length === 0 ? (
                <p>Loading events...</p>
            ) : (
                <ul>
                    {events.map((event) => (
                        <li key={event.id}>
                            <strong>{event.name}</strong> - {event.date} - {event.tickets_available} left{' '}
                            <button
                                disabled={event.tickets_available === 0}
                                onClick={() => buyTicket(event.id, event.name)}
                            >
                                {event.tickets_available > 0 ? 'Buy Ticket' : 'Sold Out'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default App;
