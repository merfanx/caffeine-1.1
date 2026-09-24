/**
 * ==============================================================================
 * CAFFEINE ACADEMIC OS - cPanel Node.js Application Startup File (app.js)
 * Designed for cPanel "Setup Node.js App" (Phusion Passenger / CloudLinux)
 * Supports modern Node.js ES Modules & CommonJS fallback
 * ==============================================================================
 */

import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// 1. Load .env if present
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const dotenv = require('dotenv');
    dotenv.config({ path: envPath });
  }
} catch (err) {
  // Dotenv is optional
}

const cpanelPort = process.env.PORT;
const INTERNAL_PORT = 3000;

console.log('[cPanel Startup] Initializing Caffeine Academic OS...');
console.log(`[cPanel Startup] cPanel PORT: ${cpanelPort || '(not set, using 3000)'}`);

// Start the internal production server
const serverBundlePath = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(serverBundlePath)) {
  console.error('[cPanel Startup ERROR] dist/server.cjs not found! Please run "npm run build" first.');
  const emergencyServer = http.createServer((req, res) => {
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Caffeine Academic OS</h1><p>لطفاً دستور <code>npm run build</code> را اجرا فرمایید تا فایل‌های dist ایجاد گردند.</p>');
  });
  emergencyServer.listen(cpanelPort || 3000);
} else {
  // Require and start the bundled server (which listens on internal 3000)
  require(serverBundlePath);

  // If cPanel Passenger provided a custom port or socket pipe (different from 3000):
  if (cpanelPort && String(cpanelPort) !== String(INTERNAL_PORT)) {
    console.log(`[cPanel Startup] Creating Passenger Reverse-Proxy from ${cpanelPort} -> 127.0.0.1:${INTERNAL_PORT}`);
    
    const proxyServer = http.createServer((clientReq, clientRes) => {
      const options = {
        hostname: '127.0.0.1',
        port: INTERNAL_PORT,
        path: clientReq.url,
        method: clientReq.method,
        headers: clientReq.headers,
      };

      // Set forwarding headers
      options.headers['x-forwarded-for'] = clientReq.headers['x-forwarded-for'] || clientReq.socket.remoteAddress;
      options.headers['x-forwarded-proto'] = clientReq.headers['x-forwarded-proto'] || 'http';

      const proxyReq = http.request(options, (proxyRes) => {
        clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(clientRes, { end: true });
      });

      proxyReq.on('error', (err) => {
        console.error('[cPanel Proxy Error]', err.message);
        if (!clientRes.headersSent) {
          clientRes.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
          clientRes.end(JSON.stringify({
            error: 'BAD_GATEWAY',
            message: 'در حال راه‌اندازی سرور کافئین... لطفاً چند لحظه دیگر صفحه را تازه‌سازی فرمایید.',
            detail: err.message
          }));
        }
      });

      clientReq.pipe(proxyReq, { end: true });
    });

    // Support WebSocket upgrades (Internal Chat, live updates)
    proxyServer.on('upgrade', (req, socket, head) => {
      const proxyReq = http.request({
        hostname: '127.0.0.1',
        port: INTERNAL_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers
      });

      proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
        socket.write(
          `HTTP/${proxyRes.httpVersion} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n` +
          Object.entries(proxyRes.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
          '\r\n\r\n'
        );
        proxySocket.pipe(socket);
        socket.pipe(proxySocket);
      });

      proxyReq.on('error', () => {
        socket.destroy();
      });

      proxyReq.end();
    });

    proxyServer.listen(cpanelPort, () => {
      console.log(`[cPanel Startup] Passenger Gateway successfully active on ${cpanelPort}`);
    });
  } else {
    console.log('[cPanel Startup] Application running directly on port 3000.');
  }
}
