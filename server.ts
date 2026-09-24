import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { createApp } from './src/server/app.js';

const PORT = 3000;

async function startServer() {
  // 1. Initialize the hardened, fully modular Express backend
  const app = createApp();
  const server = http.createServer(app);

  // 2. Explicitly serve ambient sound files with audio MIME types and Range streaming support
  const soundsPath = path.join(process.cwd(), 'public', 'sounds');
  if (fs.existsSync(soundsPath)) {
    app.use(
      '/sounds',
      express.static(soundsPath, {
        maxAge: '7d',
        acceptRanges: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.mp3')) {
            res.setHeader('Content-Type', 'audio/mpeg');
          } else if (filePath.endsWith('.wav')) {
            res.setHeader('Content-Type', 'audio/wav');
          }
          res.setHeader('Accept-Ranges', 'bytes');
        }
      })
    );
  }

  // 3. Vite Middleware in Development / Static Assets in Production
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('[ViteMiddleware] Falling back to static files:', err);
      serveStatic(app);
    }
  } else {
    serveStatic(app);
  }

  function serveStatic(appInstance: express.Express) {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      appInstance.use(
        '/assets',
        express.static(path.join(distPath, 'assets'), {
          maxAge: '1y',
          immutable: true
        })
      );

      appInstance.use(
        express.static(distPath, {
          maxAge: '1h',
          setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
              res.setHeader('Cache-Control', 'no-cache, must-revalidate');
            }
          }
        })
      );

      appInstance.get('*', (req, res) => {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          res.sendFile(indexPath);
        } else {
          res.status(404).send('Application build not found.');
        }
      });
    } else {
      appInstance.get('*', (req, res) => {
        res.status(200).send('Caffeine Academic OS server running. Please build client.');
      });
    }
  }

  // 3. Graceful Shutdown handlers
  const shutdown = (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      console.log('[Server] HTTP server closed cleanly.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[Server] Forced shutdown after 10s timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // 4. Start HTTP Server on 0.0.0.0:3000
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`☕ Caffeine Academic OS Backend Server running at http://0.0.0.0:${PORT}`);
    console.log(`📡 Health Check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`📚 API Docs: http://0.0.0.0:${PORT}/api/v1/docs`);
  });
}

startServer().catch((err) => {
  console.error('[FatalServerStartupError]', err);
  process.exit(1);
});
