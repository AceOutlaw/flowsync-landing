# FlowSync Landing Page

A modern, responsive landing page for FlowSync - Junior Developer Test Project.

## Features

- **Responsive Design**: Mobile-first approach with clean, modern styling
- **Live Development Server**: Built-in Node.js server with hot reload capability
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Zero Dependencies**: Pure HTML, CSS, and JavaScript

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm start
   ```

The server will automatically open your browser to `http://localhost:3000`.

## Project Structure

```
flowsync-landing/
├── src/
│   ├── index.html          # Main landing page
│   ├── css/
│   │   ├── reset.css       # CSS reset/normalize
│   │   └── style.css       # Main styles
│   └── js/
│       └── main.js         # JavaScript functionality
├── server.js               # Development server
├── package.json           # Project configuration
└── README.md              # This file
```

## Development Server Features

- **Live Reload**: Automatically refreshes the page when files change
- **Static File Serving**: Serves all static assets with proper MIME types
- **Error Handling**: Friendly 404 pages and error reporting
- **Cross-Platform**: Automatically opens browser on all operating systems

## Technologies Used

- HTML5
- CSS3 (Flexbox, Grid, Custom Properties)
- Vanilla JavaScript
- Node.js (development server)
- WebSocket (live reload)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - see package.json for details.