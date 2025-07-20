#!/usr/bin/env node

const { NostrClient } = require('./nostr-utils.js');

async function main () {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node nostr-cli.js <tag-value> [options]');
    console.log('       node nostr-cli.js --uri <uri-value> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --timeout <ms>     Timeout in milliseconds (default: 3000)');
    console.log('  --limit <number>   Limit number of events (default: 100)');
    console.log('  --json            Output in JSON format');
    console.log('  --relays <urls>   Comma-separated relay URLs');
    console.log('');
    console.log('Examples:');
    console.log('  node nostr-cli.js "txo:tbtc4:f0bf1cf69bfd3a7667bf4446683feba06dd6feda098f475e21682cc95f48124a:0"');
    console.log('  node nostr-cli.js --uri "some-uri" --timeout 5000 --json');
    process.exit(1);
  }

  let tagValue = '';
  let timeout = 3000;
  let limit = 100;
  let jsonOutput = false;
  let customRelays = [];

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--uri' && i + 1 < args.length) {
      tagValue = args[++i];
    } else if (arg === '--timeout' && i + 1 < args.length) {
      timeout = parseInt(args[++i]);
    } else if (arg === '--limit' && i + 1 < args.length) {
      limit = parseInt(args[++i]);
    } else if (arg === '--json') {
      jsonOutput = true;
    } else if (arg === '--relays' && i + 1 < args.length) {
      customRelays = args[++i].split(',').map(url => url.trim());
    } else if (!arg.startsWith('--') && !tagValue) {
      tagValue = arg;
    }
  }

  if (!tagValue) {
    console.error('Error: No tag value provided');
    process.exit(1);
  }

  try {
    console.log(`Fetching Nostr events for: ${tagValue}`);
    console.log(`Timeout: ${timeout}ms, Limit: ${limit}`);

    if (customRelays.length > 0) {
      console.log(`Using custom relays: ${customRelays.join(', ')}`);
    }

    console.log('Connecting to relays...\n');

    const client = new NostrClient(customRelays);
    const events = await client.fetchEvents(tagValue, { timeout, limit });

    if (events.length === 0) {
      console.log('No events found with the specified tag.');
    } else {
      console.log(`Found ${events.length} events:\n`);

      if (jsonOutput) {
        console.log(JSON.stringify(events, null, 2));
      } else {
        events.forEach((event, index) => {
          const formatted = client.formatEventForDisplay(event);
          console.log(`Event #${index + 1}:`);
          console.log(`  ID: ${formatted.id}`);
          console.log(`  Time: ${formatted.time}`);
          console.log(`  Tags: ${formatted.tags}`);
          if (formatted.content) {
            console.log(`  Content: ${formatted.content.substring(0, 100)}${formatted.content.length > 100 ? '...' : ''}`);
          }
          console.log('');
        });
      }
    }

    client.disconnect();

  } catch (error) {
    console.error('Error fetching events:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

if (require.main === module) {
  main();
} 