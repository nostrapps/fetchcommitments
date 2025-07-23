// Nostr utilities that work in both browser and Node.js
class NostrClient {
  constructor (relays = []) {
    this.relays = relays.length > 0 ? relays : [
      'wss://relay.damus.io',
      'wss://nos.lol',
      'wss://relay.nostr.band',
      'wss://nostr-pub.wellorder.net'
    ];
    this.connections = new Map();
    this.events = new Map();
  }

  generateSubscriptionId () {
    return 'sub_' + Math.random().toString(36).substring(2, 15);
  }

  async connectToRelay (relayUrl, filter) {
    return new Promise((resolve, reject) => {
      try {
        // Use WebSocket in browser, ws in Node.js
        const WebSocketClass = typeof WebSocket !== 'undefined' ? WebSocket : require('ws');
        const ws = new WebSocketClass(relayUrl);

        // Timeout for connection
        const timeoutId = setTimeout(() => {
          if (ws.readyState === (WebSocketClass.CONNECTING || 0)) {
            ws.close();
            reject(new Error(`Timeout connecting to ${relayUrl}`));
          }
        }, 5000);

        ws.onopen = () => {
          clearTimeout(timeoutId);
          console.log(`Connected to ${relayUrl}`);
          const subscription = this.generateSubscriptionId();
          const request = ["REQ", subscription, filter];
          ws.send(JSON.stringify(request));

          this.connections.set(relayUrl, { ws, subscription });
          resolve({ ws, subscription });
        };

        ws.onmessage = (event) => {
          try {
            const data = typeof event.data === 'string' ? event.data : event.data.toString();
            const message = JSON.parse(data);
            if (message[0] === "EVENT") {
              this.handleEvent(message[2]);
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        };

        ws.onerror = (error) => {
          clearTimeout(timeoutId);
          console.error(`WebSocket error for ${relayUrl}:`, error);
          reject(error);
        };

        ws.onclose = () => {
          clearTimeout(timeoutId);
          console.log(`Disconnected from ${relayUrl}`);
          this.connections.delete(relayUrl);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  handleEvent (event) {
    if (!this.events.has(event.id)) {
      this.events.set(event.id, event);
      // Call the event callback if provided
      if (this.onEvent) {
        this.onEvent(event);
      }
    }
  }

  async fetchEvents (tagValue, options = {}) {
    const { timeout = 3000, limit = 100, onEvent = null } = options;

    // Set the event callback for real-time updates
    this.onEvent = onEvent;

    this.events.clear();

    const filter = {
      "#c": [tagValue],
      limit
    };

    console.log(`Fetching events for tag: ${tagValue}`);

    const promises = this.relays.map(relayUrl =>
      this.connectToRelay(relayUrl, filter).catch(err => {
        console.warn(`Failed to connect to ${relayUrl}:`, err.message);
        return null;
      })
    );

    await Promise.allSettled(promises);

    // Wait for events to come in
    await new Promise(resolve => setTimeout(resolve, timeout));

    return Array.from(this.events.values());
  }

  disconnect () {
    this.connections.forEach(({ ws, subscription }) => {
      try {
        if (ws.readyState === (ws.OPEN || 1)) {
          ws.send(JSON.stringify(["CLOSE", subscription]));
          ws.close();
        }
      } catch (e) {
        console.warn('Error closing connection:', e);
      }
    });
    this.connections.clear();
    // Clear the event callback
    this.onEvent = null;
  }

  formatEventTime (timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }

  truncateEventId (eventId, length = 16) {
    return eventId.substring(0, length) + '...';
  }

  escapeHtml (text) {
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    // Node.js fallback
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  formatEventForDisplay (event) {
    return {
      id: this.truncateEventId(event.id),
      time: this.formatEventTime(event.created_at),
      content: event.content || '',
      tags: event.tags.map(tag => `${tag[0]}: ${tag[1] || ''}`).join(', '),
      pubkey: event.pubkey
    };
  }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js
  module.exports = { NostrClient };
} else if (typeof window !== 'undefined') {
  // Browser
  window.NostrClient = NostrClient;
} 
