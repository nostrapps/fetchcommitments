# Nostr Event Viewer

A web application and CLI tool for fetching and displaying Nostr events by tag or URI. Built with Preact/HTM for the web interface and Node.js for the CLI.

## Features

- **Web Interface**: Modern, reactive UI built with Preact and HTM
- **CLI Tool**: Command-line interface for fetching events programmatically
- **Real-time**: Connects to multiple Nostr relays simultaneously
- **URL Parameters**: Support for `?uri=` query parameter for direct linking
- **Flexible**: Works with any commitment/tag structure

## Setup

### Prerequisites

- Node.js (for CLI tool)
- A web server (for the web interface)

### Installation

1. Clone or download the project files
2. Install dependencies for CLI tool:
   ```bash
   npm install
   ```

## Usage

### Web Interface

1. Start a local web server:

   ```bash
   npm run dev
   # or
   python3 -m http.server 8000
   ```

2. Open your browser to `http://localhost:8000`

3. Enter a tag/URI in the input field and click "Fetch Events"

4. You can also use URL parameters:
   ```
   http://localhost:8000/?uri=your-commitment-uri-here
   ```

### CLI Tool

The CLI tool provides a command-line interface for fetching Nostr events:

#### Basic Usage

```bash
# Fetch events by tag
node nostr-cli.js "txo:tbtc4:f0bf1cf69bfd3a7667bf4446683feba06dd6feda098f475e21682cc95f48124a:0"

# Using the --uri flag
node nostr-cli.js --uri "your-commitment-uri"

# Using npm script
npm run cli -- "your-tag-here"
```

#### Options

```bash
--timeout <ms>     Timeout in milliseconds (default: 3000)
--limit <number>   Limit number of events (default: 100)
--json            Output in JSON format
--relays <urls>   Comma-separated relay URLs
```

#### Examples

```bash
# Basic fetch with custom timeout
node nostr-cli.js "my-tag" --timeout 5000

# JSON output for programmatic use
node nostr-cli.js "my-tag" --json

# Custom relays
node nostr-cli.js "my-tag" --relays "wss://relay1.com,wss://relay2.com"

# Combine options
node nostr-cli.js "my-tag" --timeout 10000 --limit 50 --json
```

## File Structure

- `index.html` - Web interface
- `main.js` - Preact web application
- `styles.css` - Web interface styles
- `utils.js` - Legacy utility functions
- `nostr-utils.js` - Shared Nostr client library
- `nostr-cli.js` - CLI tool
- `package.json` - Node.js dependencies and scripts

## API Reference

### NostrClient Class

The `NostrClient` class in `nostr-utils.js` provides the core functionality:

```javascript
const { NostrClient } = require('./nostr-utils.js')

const client = new NostrClient([
  'wss://relay.damus.io'
  // ... custom relays
])

// Fetch events
const events = await client.fetchEvents('tag-value', {
  timeout: 3000,
  limit: 100
})

// Format for display
const formatted = client.formatEventForDisplay(event)

// Clean up
client.disconnect()
```

### Methods

- `fetchEvents(tagValue, options)` - Fetch events from relays
- `formatEventForDisplay(event)` - Format event for display
- `formatEventTime(timestamp)` - Format Unix timestamp
- `truncateEventId(eventId, length)` - Truncate event ID
- `escapeHtml(text)` - Escape HTML characters
- `disconnect()` - Close all connections

## Nostr Relays

Default relays used:

- wss://relay.damus.io
- wss://nos.lol
- wss://relay.nostr.band
- wss://nostr-pub.wellorder.net

You can specify custom relays using the `--relays` option in the CLI or by passing them to the NostrClient constructor.

## Development

### Testing the NostrClient

```bash
npm test
```

### Running the web interface in development

```bash
npm run dev
```

## License

MIT
