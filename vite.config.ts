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

Expected JSON Schema:
{
  "name": string,
  "isShiny": boolean,
  "level": number,
  "rp": number,
  "nature": string,
  "mainSkillName": string,
  "mainSkillLevel": number,
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

              async function getAvailableModels(key: string): Promise<string[]> {
                try {
                  const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
                  if (listRes.ok) {
                    const listData = await listRes.json();
                    if (Array.isArray(listData.models)) {
                      const supported = listData.models
                        .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
                        .map((m: any) => m.name.replace(/^models\//, ''));

                      const score = (name: string) => {
                        const lower = name.toLowerCase();
                        if (lower.includes('2.5-flash')) return 100;
                        if (lower.includes('2.0-flash')) return 90;
                        if (lower.includes('1.5-flash')) return 80;
                        if (lower.includes('flash')) return 70;
                        if (lower.includes('2.5-pro')) return 60;
                        if (lower.includes('2.0-pro')) return 50;
                        if (lower.includes('1.5-pro')) return 40;
                        return 10;
                      };

                      const sorted = supported.sort((a: string, b: string) => score(b) - score(a));
                      if (sorted.length > 0) return sorted;
                    }
                  }
                } catch (e) {}

                return [
                  'gemini-2.5-flash',
                  'gemini-2.0-flash',
                  'gemini-2.0-flash-exp',
                  'gemini-1.5-flash-latest',
                  'gemini-1.5-flash',
                  'gemini-1.5-pro'
                ];
              }

              const candidateModels = await getAvailableModels(apiKey);
              let lastError: any = null;
              let resultJson = null;

              for (const model of candidateModels) {
                const cleanModel = model.replace(/^models\//, '');
                let success = false;
                for (const apiVer of ['v1beta', 'v1']) {
                  try {
                    const geminiRes = await fetch(
                      `https://generativelanguage.googleapis.com/${apiVer}/models/${cleanModel}:generateContent?key=${apiKey}`,
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
                        success = true;
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
                if (success) break;
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
