import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

function ocrServerMiddleware(env: Record<string, string>) {
  return {
    name: 'ocr-server-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/scan-pokemon') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const { imageBase64, imagesBase64, mimeType = 'image/jpeg', apiKey: userApiKey } = parsed;

              const apiKey = (
                userApiKey ||
                env.GEMINI_API_KEY ||
                env.VITE_GEMINI_API_KEY ||
                process.env.GEMINI_API_KEY ||
                process.env.VITE_GEMINI_API_KEY ||
                process.env.GOOGLE_API_KEY ||
                ''
              ).trim();

              if (!apiKey) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: 'MISSING_API_KEY',
                    message:
                      'Se requiere una API Key de Google AI Studio (Gemini Flash-Lite). Configúrala en .env.local o en la app.'
                  })
                );
                return;
              }

              const rawImages: string[] = Array.isArray(imagesBase64) && imagesBase64.length > 0
                ? imagesBase64
                : imageBase64
                ? [imageBase64]
                : [];
              const cleanImages = rawImages.map((img: string) =>
                img.replace(/^data:image\/[a-zA-Z]+;base64,/, '')
              );

              const systemPrompt = `Extract Pokémon Sleep summary data from the image(s) into JSON.
If the image contains 2 side-by-side or separate views (top stats + scrolled subskills/ingredients), merge all visible data for this single Pokémon.
Rules:
- name: species name; if top header is cut off, read candy text ("Caramelos <Name>" or "<Name> Candy").
- isShiny: true only if golden sparkle/star icon is visible near name/avatar.
- Read integer level, rp (PR/PA/RP), nature, mainSkillName, mainSkillLevel (1-7), carryLimit (bag size).
- ingredients: up to 3 slots (slot 1 lv1, slot 2 lv30, slot 3 lv60) with name and integer count (x1, x2, x4...).
- subskills: up to 5 slots (slot 1 lv10, slot 2 lv25, slot 3 lv50, slot 4 lv75, slot 5 lv100) with exact badge text.`;

              const candidateModels = [
                'gemini-3.5-flash-lite',
                'gemini-3.5-flash',
                'gemini-flash-lite-latest',
                'gemini-flash-latest'
              ];

              let lastError: any = null;
              let resultJson = null;

              for (const model of candidateModels) {
                try {
                  const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      signal: AbortSignal.timeout(12000),
                      body: JSON.stringify({
                        contents: [
                          {
                            parts: [
                              { text: systemPrompt },
                              ...cleanImages.map((data: string) => ({
                                inline_data: {
                                  mime_type: mimeType,
                                  data
                                }
                              }))
                            ]
                          }
                        ],
                        generationConfig: {
                          responseMimeType: 'application/json',
                          maxOutputTokens: 900
                        }
                      })
                    }
                  );

                  if (geminiRes.ok) {
                    const data = await geminiRes.json();
                    const parts = data.candidates?.[0]?.content?.parts || [];
                    const textPart = [...parts].reverse().find((p: any) => p && !p.thought && typeof p.text === 'string' && p.text.trim()) || parts[0];
                    const text = textPart?.text;
                    if (text) {
                      const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                      resultJson = JSON.parse(cleanText);
                      break;
                    }
                  } else {
                    const err = await geminiRes.json().catch(() => ({}));
                    lastError = new Error(err.error?.message || `HTTP ${geminiRes.status}`);
                  }
                } catch (err: any) {
                  lastError = err;
                }
              }

              if (!resultJson) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: 'VISION_FAILED',
                    message: lastError?.message || 'Error de Google AI Studio'
                  })
                );
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, data: resultJson }));
            } catch (e: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e.message || 'Error del servidor local' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    envPrefix: ['VITE_', 'SUPABASE_'],
    plugins: [
      react(),
      ocrServerMiddleware(env),
      VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        start_url: '/',
        scope: '/',
        name: 'Pokémon Sleep Master - Optimizador de Equipos',
        short_name: 'SleepMaster',
        description: 'Optimizador inteligente de equipos y gestor de Pokémon para Pokémon Sleep',
        theme_color: '#0b0f19',
        background_color: '#0b0f19',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['games', 'utilities'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        globIgnores: ['**/push-sw.js'],
        importScripts: ['/push-sw.js']
      }
    })
  ]
  };
});
