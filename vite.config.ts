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
              const { imageBase64, mimeType = 'image/jpeg', apiKey: userApiKey } = parsed;

              const apiKey =
                userApiKey ||
                env.GEMINI_API_KEY ||
                env.VITE_GEMINI_API_KEY ||
                process.env.GEMINI_API_KEY ||
                process.env.VITE_GEMINI_API_KEY ||
                process.env.GOOGLE_API_KEY;

              if (!apiKey) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    error: 'MISSING_API_KEY',
                    message:
                      'Se requiere una API Key de Google AI Studio (Gemini Flash). Configúrala en .env.local o en la app.'
                  })
                );
                return;
              }

              const cleanBase64 = (imageBase64 || '').replace(/^data:image\/[a-zA-Z]+;base64,/, '');

              const systemPrompt = `You are an expert OCR vision AI specialized in extracting data from "Pokémon Sleep" mobile screenshots.
Analyze the provided screenshot of a Pokémon summary screen and extract all fields into strict JSON format with no markdown wrappers or codeblocks.
IMPORTANT RULES:
- SCROLLED SCREENSHOTS: If the top header or Pokémon species name is scrolled off-screen or cut off, look lower down at the candy text (e.g. "Caramelos Gastly", "Caramelos Pikachu", "Pikachu Candy") to accurately determine the species name!
- INGREDIENT ICONS: In Pokémon Sleep, ingredient slots show icons with quantities (e.g. x1, x2, x4). Carefully inspect the shapes and colors of the ingredient icons.

Expected JSON Schema:
{
  "name": string,
  "isShiny": boolean,
  "level": number,
  "rp": number,
  "nature": string,
  "mainSkillName": string,
  "mainSkillLevel": number,
  "carryLimit": number,
  "ingredients": [
    { "slot": 1, "unlockLevel": 1, "name": string, "count": number },
    { "slot": 2, "unlockLevel": 30, "name": string, "count": number },
    { "slot": 3, "unlockLevel": 60, "name": string, "count": number }
  ],
  "subskills": [
    { "slot": 1, "unlockLevel": 10, "name": string },
    { "slot": 2, "unlockLevel": 25, "name": string },
    { "slot": 3, "unlockLevel": 50, "name": string },
    { "slot": 4, "unlockLevel": 75, "name": string },
    { "slot": 5, "unlockLevel": 100, "name": string }
  ]
}
Output strictly valid JSON.`;

              const candidateModels = [
                'gemini-2.5-flash',
                'gemini-2.5-flash-lite',
                'gemini-1.5-flash'
              ];

              let lastError: any = null;
              let resultJson = null;

              for (const model of candidateModels) {
                try {
                  const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        contents: [
                          {
                            parts: [
                              { text: systemPrompt },
                              {
                                inline_data: {
                                  mime_type: mimeType,
                                  data: cleanBase64
                                }
                              }
                            ]
                          }
                        ],
                        generationConfig: {
                          temperature: 0.1,
                          responseMimeType: 'application/json'
                        }
                      })
                    }
                  );

                  if (geminiRes.ok) {
                    const data = await geminiRes.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
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
                res.end(JSON.stringify({ error: lastError?.message || 'Error de Google AI Studio' }));
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ]
  };
});
