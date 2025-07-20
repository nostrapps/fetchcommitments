import { render } from 'https://esm.sh/preact@10.19.3';
import { useState, useEffect } from 'https://esm.sh/preact@10.19.3/hooks';
import { html } from 'https://esm.sh/htm@3.1.1/preact';

const RELAYS = [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.nostr.band',
    'wss://relay.snort.social',
    'wss://nostr-pub.wellorder.net'
];

function NostrEventViewer () {
    const [tagValue, setTagValue] = useState('txo:tbtc4:f0bf1cf69bfd3a7667bf4446683feba06dd6feda098f475e21682cc95f48124a:0');
    const [events, setEvents] = useState(new Map());
    const [connections, setConnections] = useState(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [status, setStatus] = useState({ message: '', isError: false, visible: false });
    const [eventsArray, setEventsArray] = useState([]);

    // Handle URL parameters on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const uriParam = urlParams.get('uri');

        if (uriParam) {
            const decodedUri = decodeURIComponent(uriParam);
            setTagValue(decodedUri);
            // Auto-fetch after setting the value
            setTimeout(() => fetchEvents(decodedUri), 100);
        }
    }, []);

    // Convert Map to Array when events change
    useEffect(() => {
        setEventsArray(Array.from(events.values()));
    }, [events]);

    // Cleanup connections on unmount
    useEffect(() => {
        return () => {
            connections.forEach(({ ws, subscription }) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(["CLOSE", subscription]));
                    ws.close();
                }
            });
        };
    }, []);

    const showStatus = (message, isError = false) => {
        setStatus({ message, isError, visible: true });
    };

    const hideStatus = () => {
        setStatus(prev => ({ ...prev, visible: false }));
    };

    const handleEvent = (event) => {
        setEvents(prevEvents => {
            if (!prevEvents.has(event.id)) {
                const newEvents = new Map(prevEvents);
                newEvents.set(event.id, event);
                return newEvents;
            }
            return prevEvents;
        });
    };

    const connectToRelay = (relayUrl, filter) => {
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(relayUrl);

                ws.onopen = () => {
                    console.log(`Connected to ${relayUrl}`);
                    const subscription = window.generateSubscriptionId();
                    const request = ["REQ", subscription, filter];
                    ws.send(JSON.stringify(request));

                    setConnections(prev => new Map(prev).set(relayUrl, { ws, subscription }));
                    resolve(ws);
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message[0] === "EVENT") {
                            handleEvent(message[2]);
                        }
                    } catch (e) {
                        console.error('Error parsing message:', e);
                    }
                };

                ws.onerror = (error) => {
                    console.error(`WebSocket error for ${relayUrl}:`, error);
                    reject(error);
                };

                ws.onclose = () => {
                    console.log(`Disconnected from ${relayUrl}`);
                    setConnections(prev => {
                        const newMap = new Map(prev);
                        newMap.delete(relayUrl);
                        return newMap;
                    });
                };

                setTimeout(() => {
                    if (ws.readyState === WebSocket.CONNECTING) {
                        ws.close();
                        reject(new Error(`Timeout connecting to ${relayUrl}`));
                    }
                }, 5000);

            } catch (error) {
                reject(error);
            }
        });
    };

    const connectToRelays = async (tagValue) => {
        const filter = {
            "#c": [tagValue],
            limit: 100
        };

        const promises = RELAYS.map(relayUrl => connectToRelay(relayUrl, filter));

        await Promise.allSettled(promises);

        setTimeout(() => {
            if (events.size === 0) {
                showStatus('No events found with the specified tag');
            } else {
                showStatus(`Found ${events.size} events`);
            }
        }, 3000);
    };

    const fetchEvents = async (customTagValue = null) => {
        const currentTagValue = customTagValue || tagValue;
        if (!currentTagValue.trim()) {
            showStatus('Please enter a tag value', true);
            return;
        }

        setIsFetching(true);
        setEvents(new Map());
        setIsLoading(true);
        hideStatus();

        try {
            await connectToRelays(currentTagValue);
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
        const timeString = window.formatEventTime(event.created_at);

        return html`
            <div class="event-card">
                <div class="event-header">
                    <span class="event-id">ID: ${window.truncateEventId(event.id)}</span>
                    <span class="event-time">${timeString}</span>
                </div>
                ${event.content ? html`<div class="event-content">${window.escapeHtml(event.content)}</div>` : ''}
                <div class="event-tags">
                    ${event.tags.map(tag => html`<span class="tag">${tag[0]}: ${window.escapeHtml(tag[1] || '')}</span>`)}
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
                    ` : eventsArray.length === 0 ? html`
                        <div class="empty-state">
                            <h3>No events found</h3>
                            <p>Try a different tag or check your connection.</p>
                        </div>
                    ` : eventsArray.map(event => {
        return html`<${EventCard} key=${event.id} event=${event} />`;
    })}
                </div>
            </div>
        </div>
    `;
}

// Render the app
render(html`<${NostrEventViewer} />`, document.getElementById('app'));