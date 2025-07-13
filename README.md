# Nostr Event Viewer

A modern, responsive web application for searching and displaying Nostr events by tag. Built with vanilla JavaScript and designed for simplicity and performance.

## 🌟 Features

- **Real-time Event Fetching**: Connects to multiple Nostr relays simultaneously
- **Tag-based Search**: Filter events using custom tag values
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, gradient-based interface with smooth animations
- **Multiple Relay Support**: Connects to 5 popular Nostr relays for comprehensive coverage
- **Real-time Updates**: Events appear as they're received from relays
- **Duplicate Prevention**: Automatically filters duplicate events

## 🚀 Demo

Visit the live demo: [https://nostrapps.github.io/fetchcommitments/](https://nostrapps.github.io/fetchcommitments/)

## 📱 Screenshots

The application features a modern interface with:
- Gradient header with clear branding
- Simple tag input with search functionality
- Real-time event cards with timestamps and content
- Responsive design that adapts to any screen size

## 🛠 Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with modern features (Grid, Flexbox, Gradients)
- **WebSockets**: Native WebSocket API for Nostr relay connections
- **Deployment**: GitHub Pages

## 📋 How It Works

1. **Enter a Tag**: Input any Nostr tag value (e.g., `txo:tbtc4:...`)
2. **Fetch Events**: Click "Fetch Events" or press Enter
3. **Real-time Results**: Watch as events matching your tag appear in real-time
4. **Event Details**: View event content, timestamps, and associated tags

## 🔧 Installation & Usage

### Option 1: Use Online (Recommended)
Simply visit [https://nostrapps.github.io/fetchcommitments/](https://nostrapps.github.io/fetchcommitments/)

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/nostrapps/fetchcommitments.git

# Navigate to the project directory
cd fetchcommitments

# Open in your browser
open index.html
# or serve with a local server
python -m http.server 8000
```

## 🌐 Supported Relays

The application connects to these popular Nostr relays:
- `wss://relay.damus.io`
- `wss://nos.lol`
- `wss://relay.nostr.band`
- `wss://relay.snort.social`
- `wss://nostr-pub.wellorder.net`

## 📡 Nostr Protocol

This application implements the [Nostr protocol](https://github.com/nostr-protocol/nips) specifications:
- **NIP-01**: Basic protocol flow
- **NIP-12**: Filter and subscription management
- Tag-based event filtering using the `#c` tag

## 🎯 Use Cases

- **Event Monitoring**: Track specific commitments or transactions
- **Development & Testing**: Debug Nostr applications and event flows
- **Research**: Analyze Nostr network activity and event patterns
- **Education**: Learn how Nostr events and relays work

## 🔍 Example Tags

Try these example tag values:
```
txo:tbtc4:f0bf1cf69bfd3a7667bf4446683feba06dd6feda098f475e21682cc95f48124a:0
commitment:example
event:type:custom
```

## 🛡 Security Features

- **XSS Prevention**: All user content is properly escaped
- **Connection Timeouts**: Prevents hanging connections
- **Error Handling**: Graceful handling of network failures
- **Input Validation**: Validates tag input before processing

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Adapts to medium screen sizes
- **Desktop**: Full-featured experience on large screens
- **Accessibility**: Keyboard navigation and screen reader friendly

## 🔧 Configuration

The application uses sensible defaults but can be customized:
- Relay list can be modified in the `relays` array
- Event limit can be adjusted in the filter configuration
- Styling can be customized via CSS variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Nostr Protocol](https://github.com/nostr-protocol/nips) - The decentralized social network protocol
- [Damus](https://damus.io/) - For providing reliable relay infrastructure
- The Nostr community for their continued development and support

## 🐛 Issues & Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/nostrapps/fetchcommitments/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🚀 Future Enhancements

- [ ] Event caching for improved performance
- [ ] Advanced filtering options
- [ ] Export functionality for events
- [ ] Custom relay configuration
- [ ] Event visualization and analytics
- [ ] Dark/light theme toggle

---

**Built with ❤️ for the Nostr community**