console.log('Starting server.ts');
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';

export function app(): express.Express {
  console.log('Inside app() function');
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  
  console.log('Server dist folder:', serverDistFolder);
  console.log('Browser dist folder:', browserDistFolder);
  
  // More robust path handling with validation
  let indexHtml: string | undefined = undefined;
  
  const possibleIndexPaths = [
    join(browserDistFolder, 'index.original.html'),
    join(serverDistFolder, 'index.server.html'),
    join(browserDistFolder, 'index.html')
  ];
  
  for (const path of possibleIndexPaths) {
  console.log('Checking for index file at:', path, 'Exists:', existsSync(path));
  if (existsSync(path)) {
    indexHtml = path;
    console.log('Using index.html at:', path);
    break;
  }
}
if (!indexHtml) {
  throw new Error('Could not find index.html in any of the expected locations: ' + possibleIndexPaths.join(', '));
}
  
  if (!indexHtml) {
    throw new Error('Could not find index.html in any of the expected locations');
  }

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', async (req, res, next) => {
    try {
      const serverModulePath = join(serverDistFolder, 'main.server.mjs');
      console.log('Looking for server module at:', serverModulePath);
      if (!existsSync(serverModulePath)) {
        throw new Error(`Server module not found at: ${serverModulePath}`);
      }
      // Use pathToFileURL for cross-platform compatibility
      const serverModuleUrl = pathToFileURL(serverModulePath).href;
      const serverModule = await import(serverModuleUrl);
      const bootstrap = serverModule.default || serverModule;
      if (!bootstrap) {
        throw new Error('Bootstrap function not found in server module');
      }
      const host = req.headers.host || 'localhost:4000';
      const url = `${req.protocol}://${host}${req.originalUrl}`;
      console.log('Rendering URL:', url);
      const html = await commonEngine.render({
        bootstrap,
        documentFilePath: indexHtml,
        url: url,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: req.baseUrl },
        ],
      });
      res.send(html);
    } catch (err) {
      console.error('SSR Error:', err);
      // Fallback to client-side rendering
      console.log('Falling back to client-side rendering');
      if (indexHtml) {
        res.sendFile(indexHtml);
      } else {
        res.status(500).send('index.html not found');
      }
    }
  });
  return server;
}

function run(): void {
  console.log('Inside run() function');
  const port = process.env['PORT'] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

console.log('About to call run()');
run();