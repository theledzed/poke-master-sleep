// Vercel Serverless Function: POST /api/scan-pokemon
// Analyzes a Pokémon Sleep screenshot using Gemini 2.0 Flash Vision

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg', apiKey: userApiKey } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: 'Falta la imagen en base64 (imageBase64).' });
    }

    // Determine API Key: Environment variable or client-provided key
    const apiKey =
      userApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(401).json({
        error: 'MISSING_API_KEY',
        message:
          'Se requiere una API Key de Google AI Studio (Gemini Flash). Configúrala en el servidor o ingrésala en la app.'
      });
    }

    // Clean base64 string if it contains data prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const systemPrompt = `You are an expert OCR vision AI specialized in extracting data from "Pokémon Sleep" mobile screenshots.
Analyze the provided screenshot of a Pokémon summary screen and extract all fields into strict JSON format with no markdown wrappers or codeblocks.

Expected JSON Schema:
{
  "name": string,              // Official species name in Spanish or English (e.g. "Ribombee", "Pikachu", "Gastly", "Slowpoke", "Charizard")
  "isShiny": boolean,          // true if there is a golden sparkles / star icon near the name or avatar, else false
  "level": number,             // integer level (e.g. 20, 33, 50)
  "rp": number,                // total RP / PA (Puntos de Ayuda, e.g. 989, 1420, 2723)
  "nature": string,            // nature name (e.g. "Audaz", "Huraña", "Firme", "Alegre", "Adamant", "Modest", etc.)
  "mainSkillName": string,     // main skill name if visible (e.g. "Afortunado", "Imán ingredientes S", "Carga vigor S")
  "mainSkillLevel": number,    // main skill level (integer 1-7, default 1)
  "ingredients": [             // up to 3 ingredient slots:
    { "slot": 1, "unlockLevel": 1, "name": string, "count": number },
    { "slot": 2, "unlockLevel": 30, "name": string, "count": number },
    { "slot": 3, "unlockLevel": 60, "name": string, "count": number }
  ],
  "subskills": [               // up to 5 subskills unlocked at levels 10, 25, 50, 75, 100:
    { "slot": 1, "unlockLevel": 10, "name": string },
    { "slot": 2, "unlockLevel": 25, "name": string },
    { "slot": 3, "unlockLevel": 50, "name": string },
    { "slot": 4, "unlockLevel": 75, "name": string },
    { "slot": 5, "unlockLevel": 100, "name": string }
  ]
}

Ensure accurate reading of ingredient counts (e.g. x1, x2, x4) and subskill tier names.
Output strictly valid JSON.`;

    // Helper to query available models for this specific API key
    async function getAvailableModels(key: string): Promise<string[]> {
      try {
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );
        if (listRes.ok) {
          const listData = await listRes.json();
          if (Array.isArray(listData.models)) {
            const supported = listData.models
              .filter(
                (m: any) =>
                  Array.isArray(m.supportedGenerationMethods) &&
                  m.supportedGenerationMethods.includes('generateContent')
              )
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
              if (lower.includes('pro')) return 30;
              return 10;
            };

            const sorted = supported.sort((a: string, b: string) => score(b) - score(a));
            if (sorted.length > 0) return sorted;
          }
        }
      } catch (e: any) {
        console.warn('Failed to query ListModels, falling back to static list:', e.message);
      }

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
    console.log('Available models for OCR:', candidateModels.slice(0, 5));

    let lastError: any = null;
    let resultJson = null;

    // Try candidate models across v1beta and v1
    for (const model of candidateModels) {
      const cleanModel = model.replace(/^models\//, '');
      let modelSucceeded = false;

      for (const apiVer of ['v1beta', 'v1']) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${cleanModel}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
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
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP ${response.status}`);
          }

          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            // Strip any code fences if present
            const cleanText = candidateText
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();
            resultJson = JSON.parse(cleanText);
            modelSucceeded = true;
            break;
          }
        } catch (err: any) {
          lastError = err;
          // Continue to next api version or model
        }
      }

      if (modelSucceeded) {
        break;
      }
    }

    if (!resultJson) {
      return res.status(502).json({
        error: 'VISION_FAILED',
        message: `Error al procesar con Gemini Vision: ${lastError?.message || 'Sin respuesta del modelo'}`
      });
    }

    return res.status(200).json({
      success: true,
      data: resultJson
    });
  } catch (error: any) {
    console.error('OCR Handler error:', error);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: error.message || 'Error interno del servidor al procesar la captura'
    });
  }
}
