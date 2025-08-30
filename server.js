/**
 * FlowSync Landing Page - Development Server
 * Simple Node.js static file server with live reload capability
 * Cross-platform compatible (Windows, macOS, Linux)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chokidar = require('chokidar');
const mimeTypes = require('mime-types');

// ==========================================================================
// Configuration
// ==========================================================================

const config = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    staticDir: path.join(__dirname, 'src'),
    watchPatterns: [
        'src/**/*.html',
        'src/**/*.css',
        'src/**/*.js',
        'src/**/*.png',
        'src/**/*.jpg',
        'src/**/*.jpeg',
        'src/**/*.gif',
        'src/**/*.svg'
    ],
    excludePatterns: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**'
    ]
};

// ==========================================================================
// MIME Type Configuration
// ==========================================================================

const customMimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

// ==========================================================================
// Live Reload Script Injection
// ==========================================================================

const liveReloadScript = `
<script>
(function() {
    'use strict';
    
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    const reconnectInterval = 2000;
    
    function connect() {
        const ws = new WebSocket('ws://localhost:${config.port + 1}');
        
        ws.onopen = function() {
            console.log('[Live Reload] Connected to server');
            reconnectAttempts = 0;
        };
        
        ws.onmessage = function(event) {
            if (event.data === 'reload') {
                console.log('[Live Reload] Reloading page...');
                window.location.reload();
            }
        };
        
        ws.onclose = function() {
            console.log('[Live Reload] Connection closed');
            
            if (reconnectAttempts < maxReconnectAttempts) {
                setTimeout(() => {
                    reconnectAttempts++;
                    console.log('[Live Reload] Attempting to reconnect... (' + reconnectAttempts + '/' + maxReconnectAttempts + ')');
                    connect();
                }, reconnectInterval);
            } else {
                console.log('[Live Reload] Max reconnection attempts reached');
            }
        };
        
        ws.onerror = function(error) {
            console.error('[Live Reload] WebSocket error:', error);
        };
    }
    
    // Start connection when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', connect);
    } else {
        connect();
    }
})();
</script>
`;

// ==========================================================================
// WebSocket Server for Live Reload
// ==========================================================================

let wsServer;
let wsConnections = [];

function createWebSocketServer() {
    try {
        const WebSocket = require('ws');
        wsServer = new WebSocket.Server({ port: config.port + 1 });
        
        wsServer.on('connection', (ws) => {
            wsConnections.push(ws);
            console.log(`[Live Reload] Client connected (${wsConnections.length} total)`);
            
            ws.on('close', () => {
                wsConnections = wsConnections.filter(conn => conn !== ws);
                console.log(`[Live Reload] Client disconnected (${wsConnections.length} remaining)`);
            });
        });
        
        console.log(`[Live Reload] WebSocket server started on port ${config.port + 1}`);
        
    } catch (error) {
        console.warn('[Live Reload] WebSocket not available, live reload disabled');
        console.warn('Run "npm install ws" to enable live reload functionality');
    }
}

function broadcastReload() {
    if (wsConnections.length > 0) {
        wsConnections.forEach(ws => {
            if (ws.readyState === 1) { // WebSocket.OPEN
                ws.send('reload');
            }
        });
        console.log(`[Live Reload] Reload signal sent to ${wsConnections.length} client(s)`);
    }
}

// ==========================================================================
// File Watcher
// ==========================================================================

function setupFileWatcher() {
    console.log('[File Watcher] Setting up file watcher...');
    
    const watcher = chokidar.watch(config.watchPatterns, {
        ignored: config.excludePatterns,
        ignoreInitial: true,
        persistent: true
    });
    
    // Debounce file changes to avoid multiple rapid reloads
    let reloadTimer;
    
    function scheduleReload(eventType, filePath) {
        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(() => {
            console.log(`[File Watcher] ${eventType}: ${path.relative(process.cwd(), filePath)}`);
            broadcastReload();
        }, 100);
    }
    
    watcher
        .on('change', (filePath) => scheduleReload('Changed', filePath))
        .on('add', (filePath) => scheduleReload('Added', filePath))
        .on('unlink', (filePath) => scheduleReload('Removed', filePath))
        .on('error', (error) => console.error('[File Watcher] Error:', error));
    
    console.log('[File Watcher] Watching for changes in:', config.watchPatterns);
}

// ==========================================================================
// HTTP Server
// ==========================================================================

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return customMimeTypes[ext] || mimeTypes.lookup(filePath) || 'application/octet-stream';
}

function serveFile(res, filePath) {
    const fullPath = path.join(config.staticDir, filePath);
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>404 - File Not Found</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                            text-align: center; 
                            padding: 50px; 
                            color: #333; 
                        }
                        h1 { color: #e74c3c; }
                        .back-link { 
                            display: inline-block; 
                            margin-top: 20px; 
                            padding: 10px 20px; 
                            background: #4a90e2; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 5px; 
                        }
                    </style>
                </head>
                <body>
                    <h1>404 - File Not Found</h1>
                    <p>The requested file <code>${filePath}</code> could not be found.</p>
                    <a href="/" class="back-link">← Back to Home</a>
                </body>
                </html>
            `);
            return;
        }
        
        const mimeType = getMimeType(filePath);
        const headers = {
            'Content-Type': mimeType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        };
        
        // Inject live reload script into HTML files
        if (mimeType.includes('text/html') && wsServer) {
            const htmlContent = data.toString();
            const modifiedHtml = htmlContent.replace('</body>', `${liveReloadScript}</body>`);
            data = Buffer.from(modifiedHtml);
            headers['Content-Length'] = data.length;
        }
        
        res.writeHead(200, headers);
        res.end(data);
    });
}

function createHttpServer() {
    const server = http.createServer((req, res) => {
        let urlPath = req.url.split('?')[0]; // Remove query parameters
        
        // Security: Prevent directory traversal
        urlPath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
        
        // Default to index.html for root and directory requests
        if (urlPath === '/' || urlPath.endsWith('/')) {
            urlPath = path.join(urlPath, 'index.html');
        }
        
        // Remove leading slash
        urlPath = urlPath.replace(/^\//, '');
        
        // Log request
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
        
        serveFile(res, urlPath);
    });
    
    return server;
}

// ==========================================================================
// Browser Opening Utility
// ==========================================================================

function openBrowser(url) {
    const platform = process.platform;
    let command;
    
    switch (platform) {
        case 'darwin': // macOS
            command = `open "${url}"`;
            break;
        case 'win32': // Windows
            command = `start "" "${url}"`;
            break;
        default: // Linux and others
            command = `xdg-open "${url}"`;
            break;
    }
    
    exec(command, (err) => {
        if (err) {
            console.log(`[Browser] Could not open browser automatically. Please visit: ${url}`);
        } else {
            console.log(`[Browser] Opening ${url} in your default browser...`);
        }
    });
}

// ==========================================================================
// Server Startup
// ==========================================================================

function startServer() {
    console.log('='.repeat(60));
    console.log('🚀 FlowSync Landing Page Development Server');
    console.log('='.repeat(60));
    
    const server = createHttpServer();
    
    server.listen(config.port, config.host, () => {
        const serverUrl = `http://${config.host}:${config.port}`;
        
        console.log(`✅ Server running at: ${serverUrl}`);
        console.log(`📁 Serving files from: ${config.staticDir}`);
        console.log(`🖥️  Platform: ${process.platform}`);
        console.log(`📦 Node.js: ${process.version}`);
        
        // Setup live reload
        createWebSocketServer();
        setupFileWatcher();
        
        console.log('='.repeat(60));
        console.log('📝 Available commands:');
        console.log('   Ctrl+C or Cmd+C: Stop the server');
        console.log('='.repeat(60));
        
        // Open browser automatically (after a short delay)
        setTimeout(() => {
            openBrowser(serverUrl);
        }, 1000);
    });
    
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${config.port} is already in use.`);
            console.log(`💡 Try running with a different port: PORT=3001 node server.js`);
        } else {
            console.error('❌ Server error:', err);
        }
        process.exit(1);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n👋 Shutting down server...');
        server.close(() => {
            if (wsServer) {
                wsServer.close();
            }
            console.log('✅ Server stopped successfully');
            process.exit(0);
        });
    });
}

// ==========================================================================
// Error Handling
// ==========================================================================

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// ==========================================================================
// Start the server
// ==========================================================================

if (require.main === module) {
    startServer();
}

module.exports = { startServer, config };