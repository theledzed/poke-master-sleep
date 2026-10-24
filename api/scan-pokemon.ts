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
    const { imageBase64, imagesBase64, mimeType = 'image/jpeg', apiKey: userApiKey } = req.body || {};

    const rawImages: string[] = Array.isArray(imagesBase64) && imagesBase64.length > 0
      ? imagesBase64
      : imageBase64
      ? [imageBase64]
      : [];

    if (rawImages.length === 0) {
      return res.status(400).json({ error: 'Falta la imagen en base64 (imageBase64 o imagesBase64).' });
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

    // Clean base64 strings
    const cleanImages = rawImages.map(img => img.replace(/^data:image\/[a-zA-Z]+;base64,/, ''));

    const systemPrompt = `You are an expert OCR vision AI specialized in extracting data from "Pokémon Sleep" mobile screenshots.
You may be provided with 1 or 2 screenshots of the same Pokémon (e.g. top section with Level/RP/Nature and a second scrolled section showing all 5 Subskills and 3 Ingredient slots).
Combine and synthesize all visible information across all provided screenshots to create a single complete JSON representation of the Pokémon.
IMPORTANT RULES:
- SCROLLED SCREENSHOTS: If the top header or Pokémon species name is scrolled off-screen or cut off, look lower down at the candy text (e.g. "Caramelos Gastly", "Caramelos Pikachu", "Pikachu Candy") to accurately determine the species name!
- INGREDIENT ICONS: In Pokémon Sleep, ingredient slots show icons with quantities (e.g. x1, x2, x4). Carefully inspect the shapes and colors of the ingredient icons.

Expected JSON Schema:
{
  "name": string,              // Official species name in Spanish or English (e.g. "Ribombee", "Pikachu", "Gastly", "Slowpoke", "Charizard")
  "isShiny": boolean,          // true if there is a golden sparkles / star icon near the name or avatar, else false
  "level": number,             // integer level (e.g. 20, 33, 50)
  "rp": number,                // total RP / PA (Puntos de Ayuda, e.g. 989, 1420, 2723)
  "nature": string,            // nature name (e.g. "Audaz", "Huraña", "Firme", "Alegre", "Adamant", "Modest", etc.)
  "mainSkillName": string,     // main skill name if visible (e.g. "Afortunado", "Imán ingredientes S", "Carga vigor S")
  "mainSkillLevel": number,    // main skill level (integer 1-7, default 1)
  "carryLimit": number,        // bag / inventory capacity if visible (integer, e.g. 19, 24, 30)
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

    // Fast-path prioritized models: Gemini 2.5 Flash / Flash Lite with dynamic fallback
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-1.5-flash'
    ];

    let lastError: any = null;
    let resultJson = null;

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  ...cleanImages.map((data) => ({
                    inline_data: {
                      mime_type: mimeType,
                      data
                    }
                  }))
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
          const cleanText = candidateText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          resultJson = JSON.parse(cleanText);
          break;
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    // Dynamic auto-discovery fallback if hardcoded models are deprecated or not found
    if (!resultJson && lastError && (String(lastError?.message).includes('no longer available') || String(lastError?.message).includes('not found'))) {
      try {
        const catRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          const dynamicModels = (catData.models || [])
            .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent') && (m.name || '').includes('flash'))
            .map((m: any) => (m.name || '').replace('models/', ''));
          for (const dModel of dynamicModels) {
            if (candidateModels.includes(dModel)) continue;
            try {
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${dModel}:generateContent?key=${apiKey}`;
              const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: systemPrompt }, ...cleanImages.map((data) => ({ inline_data: { mime_type: mimeType, data } }))] }],
                  generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
                })
              });
              if (resp.ok) {
                const data = await resp.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  resultJson = JSON.parse(text.replace(/```json/gi, '').replace(/```/g, '').trim());
                  break;
                }
              }
            } catch {}
          }
        }
      } catch {}
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
