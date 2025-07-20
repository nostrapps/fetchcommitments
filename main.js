class NostrEventViewer {
    constructor () {
        this.relays = [
            'wss://relay.damus.io',
            'wss://nos.lol',
            'wss://relay.nostr.band',
            'wss://relay.snort.social',
            'wss://nostr-pub.wellorder.net'
        ];
        this.connections = new Map();
        this.events = new Set();
        this.initializeElements();
        this.bindEvents();
        this.handleUrlParameters();
    }

    initializeElements () {
        this.tagInput = document.getElementById('tagInput');
        this.fetchBtn = document.getElementById('fetchBtn');
        this.status = document.getElementById('status');
        this.eventsDisplay = document.getElementById('eventsDisplay');
    }

    bindEvents () {
        this.fetchBtn.addEventListener('click', () => this.fetchEvents());
        this.tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.fetchEvents();
        });
    }

    handleUrlParameters () {
        const urlParams = new URLSearchParams(window.location.search);
        const uriParam = urlParams.get('uri');

        if (uriParam) {
            // Populate the input field with the URI parameter
            this.tagInput.value = decodeURIComponent(uriParam);
            // Auto-fetch events when URI is provided
            this.fetchEvents();
        }
    }

    showStatus (message, isError = false) {
        this.status.textContent = message;
        this.status.className = isError ? 'status error' : 'status';
        this.status.style.display = 'block';
    }

    hideStatus () {
        this.status.style.display = 'none';
    }

    showLoading () {
        this.eventsDisplay.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Connecting to Nostr relays and fetching events...</p>
            </div>
        `;
    }

    async fetchEvents () {
        const tagValue = this.tagInput.value.trim();
        if (!tagValue) {
            this.showStatus('Please enter a tag value', true);
            return;
        }

        this.fetchBtn.disabled = true;
        this.fetchBtn.textContent = 'Fetching...';
        this.events.clear();
        this.showLoading();
        this.hideStatus();

        try {
            await this.connectToRelays(tagValue);
        } catch (error) {
            console.error('Error fetching events:', error);
            this.showStatus('Error fetching events. Please try again.', true);
        } finally {
            this.fetchBtn.disabled = false;
            this.fetchBtn.textContent = 'Fetch Events';
        }
    }

    async connectToRelays (tagValue) {
        const filter = {
            "#c": [tagValue],
            limit: 100
        };

        const promises = this.relays.map(relayUrl => this.connectToRelay(relayUrl, filter));

        await Promise.allSettled(promises);

        setTimeout(() => {
            this.displayEvents();
            if (this.events.size === 0) {
                this.showStatus('No events found with the specified tag');
            } else {
                this.showStatus(`Found ${this.events.size} events`);
            }
        }, 3000);
    }

    connectToRelay (relayUrl, filter) {
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(relayUrl);

                ws.onopen = () => {
                    console.log(`Connected to ${relayUrl}`);
                    const subscription = generateSubscriptionId();
                    const request = ["REQ", subscription, filter];
                    ws.send(JSON.stringify(request));

                    this.connections.set(relayUrl, { ws, subscription });
                    resolve(ws);
                };

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message[0] === "EVENT") {
                            this.handleEvent(message[2]);
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
                    this.connections.delete(relayUrl);
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
    }

    handleEvent (event) {
        if (!this.events.has(event.id)) {
            this.events.add(event.id);
            this.addEventToDisplay(event);
        }
    }

    addEventToDisplay (event) {
        const eventElement = this.createEventElement(event);

        if (this.eventsDisplay.firstChild && !this.eventsDisplay.firstChild.classList?.contains('loading')) {
            this.eventsDisplay.insertBefore(eventElement, this.eventsDisplay.firstChild);
        } else {
            this.eventsDisplay.innerHTML = '';
            this.eventsDisplay.appendChild(eventElement);
        }
    }

    createEventElement (event) {
        const div = document.createElement('div');
        div.className = 'event-card';

        const timeString = formatEventTime(event.created_at);

        div.innerHTML = `
            <div class="event-header">
                <span class="event-id">ID: ${truncateEventId(event.id)}</span>
                <span class="event-time">${timeString}</span>
            </div>
            ${event.content ? `<div class="event-content">${escapeHtml(event.content)}</div>` : ''}
            <div class="event-tags">
                ${event.tags.map(tag => `<span class="tag">${tag[0]}: ${escapeHtml(tag[1] || '')}</span>`).join('')}
            </div>
        `;

        return div;
    }

    displayEvents () {
        if (this.events.size === 0) {
            this.eventsDisplay.innerHTML = `
                <div class="empty-state">
                    <h3>No events found</h3>
                    <p>Try a different tag or check your connection.</p>
                </div>
            `;
        }
    }

    disconnect () {
        this.connections.forEach(({ ws, subscription }, relayUrl) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(["CLOSE", subscription]));
                ws.close();
            }
        });
        this.connections.clear();
    }
}

const nostrViewer = new NostrEventViewer();

window.addEventListener('beforeunload', () => {
    nostrViewer.disconnect();
});