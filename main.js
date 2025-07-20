import { render } from 'https://esm.sh/preact@10.19.3';
import { useState, useEffect } from 'https://esm.sh/preact@10.19.3/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact';

function NostrEventViewer () {
    const [tagValue, setTagValue] = useState('txo:tbtc4:f0bf1cf69bfd3a7667bf4446683feba06dd6feda098f475e21682cc95f48124a:0');
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [status, setStatus] = useState({ message: '', isError: false, visible: false });
    const [client, setClient] = useState(null);
    const [autoFetchDone, setAutoFetchDone] = useState(false);

    // Initialize client
    useEffect(() => {
        const nostrClient = new window.NostrClient();
        setClient(nostrClient);

        return () => {
            if (nostrClient) {
                nostrClient.disconnect();
            }
        };
    }, []);

    // Handle URL parameters after client is initialized
    useEffect(() => {
        if (!client) return; // Wait for client to be initialized

        const urlParams = new URLSearchParams(window.location.search);
        const uriParam = urlParams.get('uri');

        if (uriParam && !autoFetchDone) {
            const decodedUri = decodeURIComponent(uriParam);
            setTagValue(decodedUri);
            // Auto-fetch immediately when URI is provided
            fetchEvents(decodedUri);
            setAutoFetchDone(true);
        }
    }, [client]); // Depend on client being available

    const showStatus = (message, isError = false) => {
        setStatus({ message, isError, visible: true });
    };

    const hideStatus = () => {
        setStatus(prev => ({ ...prev, visible: false }));
    };

    const fetchEvents = async (customTagValue = null) => {
        if (!client) return;

        const currentTagValue = customTagValue || tagValue;
        if (!currentTagValue.trim()) {
            showStatus('Please enter a tag value', true);
            return;
        }

        setIsFetching(true);
        setEvents([]);
        setIsLoading(true);
        hideStatus();

        try {
            // Real-time event handler
            const handleNewEvent = (event) => {
                setEvents(prevEvents => {
                    // Check if event already exists
                    if (prevEvents.find(e => e.id === event.id)) {
                        return prevEvents;
                    }
                    // Add new event at the beginning
                    return [event, ...prevEvents];
                });
            };

            const fetchedEvents = await client.fetchEvents(currentTagValue, {
                timeout: 3000,
                limit: 100,
                onEvent: handleNewEvent
            });

            // Update status based on final results
            if (fetchedEvents.length === 0) {
                showStatus('No events found with the specified tag');
            } else {
                showStatus(`Found ${fetchedEvents.length} events`);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            showStatus('Error fetching events. Please try again.', true);
        } finally {
            setIsFetching(false);
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setTagValue(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            fetchEvents();
        }
    };

    const EventCard = ({ event }) => {
        if (!client) return null;

        const timeString = client.formatEventTime(event.created_at);

        return html`
            <div class="event-card">
                <div class="event-header">
                    <span class="event-id">ID: ${client.truncateEventId(event.id)}</span>
                    <span class="event-time">${timeString}</span>
                </div>
                ${event.content ? html`<div class="event-content">${client.escapeHtml(event.content)}</div>` : ''}
                <div class="event-tags">
                    ${event.tags.map(tag => html`<span class="tag">${tag[0]}: ${client.escapeHtml(tag[1] || '')}</span>`)}
                </div>
            </div>
        `;
    };

    return html`
        <div class="container">
            <div class="header">
                <h1>Nostr Event Viewer</h1>
                <p>Search and display Nostr events by tag or URI</p>
            </div>

            <div class="controls">
                <div class="input-group">
                    <label for="tagInput">Tag/URI:</label>
                    <input 
                        type="text" 
                        id="tagInput" 
                        class="tag-input"
                        placeholder="Enter tag value or URI (e.g., txo:tbtc4:f0bf1cf69bfd3a7667bf4446683feba06dd6feda098f475e21682cc95f48124a:0)"
                        value=${tagValue}
                        onInput=${handleInputChange}
                        onKeyPress=${handleKeyPress}
                    />
                    <button 
                        id="fetchBtn" 
                        class="btn" 
                        disabled=${isFetching}
                        onClick=${() => fetchEvents()}
                    >
                        ${isFetching ? 'Fetching...' : 'Fetch Events'}
                    </button>
                </div>
            </div>

            ${status.visible ? html`
                <div id="status" class=${`status ${status.isError ? 'error' : ''}`}>
                    ${status.message}
                </div>
            ` : ''}

            <div class="events-container">
                <div id="eventsDisplay">
                    ${isLoading ? html`
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Connecting to Nostr relays and fetching events...</p>
                        </div>
                    ` : events.length === 0 ? html`
                        <div class="empty-state">
                            <h3>No events found</h3>
                            <p>Try a different tag or check your connection.</p>
                        </div>
                    ` : events.map(event => {
        return html`<${EventCard} key=${event.id} event=${event} />`;
    })}
                </div>
            </div>
        </div>
    `;
}

// Render the app
render(html`<${NostrEventViewer} />`, document.getElementById('app'));