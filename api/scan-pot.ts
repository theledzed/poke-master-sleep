// Vercel Serverless Function: POST /api/scan-pot
// Analyzes Pokémon Sleep cooking pot / ingredient inventory screenshots using Gemini 2.0 Flash Vision

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

    const systemPrompt = `You are an expert OCR vision AI specialized in extracting cooking pot and ingredient inventory data from "Pokémon Sleep" mobile screenshots.
You may be provided with 1 or 2 screenshots showing the cooking pot screen or ingredient selection screen ("Elige los ingredientes" / "Añadido: X/Y").

COMBINE AND SYNTHESIZE ALL PROVIDED SCREENSHOTS:
1. POT CAPACITY ("Añadido: X/Y"):
   - Look at the top banner (e.g. "Añadido: 0/59" or "Añadido: 0/45").
   - The total pot capacity is the second number (e.g. 59, 45, 57, 69, 77, 118).
   - If not found or obscured, return 57.

2. INGREDIENTS LIST:
   - Each ingredient card in the grid shows:
     - An icon of the ingredient (apple, mushroom, tomato, egg, potato, ginger, cacao, leek, tail, honey, oil, sausage, milk, etc.)
     - A counter below the image formatted as: "[ADDED] / [TOTAL_AVAILABLE]" (e.g. "0/4", "0/11", "0/6", "0/15", "0/22").
     - The text label with the Spanish or English ingredient name below the counter (e.g. "Seta Sabrosa", "Huevo Selecto", "Patata", "Manzana Selecta", "Hierba Picante", "Fiambre Vegetariano", "Leche Mu-mu", "Siestomate", "Soja Verdegal", "Cacao Relajante", "Miel", "Aceite Puro", "Jengibre", "Maíz Verdegal", "Café Estimulante", "Puerro Grueso", "Cola de Slowpoke", "Calabaza Suculenta", "Aguacate").
   - CRITICAL RULE: The player's available inventory count is the NUMBER AFTER THE SLASH (the denominator)!
     For example:
     - "0/4" means quantity: 4
     - "0/11" means quantity: 11
     - "0/22" means quantity: 22
     - "0/15" means quantity: 15
     - "0/6" means quantity: 6
     - "0/5" means quantity: 5
   - If multiple screenshots are provided (e.g. user scrolled down to show the rest of their ingredients), combine them into a single deduplicated list. If the same ingredient appears in both, use the larger/clearer count.

CANONICAL INGREDIENT NAMES IN POKÉMON SLEEP (Spanish):
- "Puerro Grueso"
- "Seta Sabrosa"
- "Huevo Selecto"
- "Patata"
- "Manzana Selecta"
- "Hierba Picante"
- "Fiambre Vegetariano"
- "Leche Mu-mu"
- "Miel"
- "Aceite Puro"
- "Jengibre"
- "Siestomate"
- "Cacao Relajante"
- "Cola de Slowpoke"
- "Soja Verdegal"
- "Maíz Verdegal"
- "Café Estimulante"
- "Calabaza Suculenta"
- "Aguacate"

Expected JSON Output Schema:
{
  "potCapacity": number,        // e.g. 59, 45, 57
  "currentAdded": number,       // e.g. 0
  "dishType": string | null,    // "curry", "salad", "dessert" if visible on screen, else null
  "ingredients": [
    {
      "name": string,           // Canonical Spanish name from the list above
      "quantity": number        // Available count (the denominator)
    }
  ]
}

Output strictly valid JSON.`;

    const candidateModels = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-2.0-flash-lite'
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

    if (!resultJson) {
      throw new Error(
        lastError?.message ||
          'Ningún modelo de Gemini pudo procesar la captura de la olla. Verifica tu API Key o la nitidez de la imagen.'
      );
    }

    return res.status(200).json({
      success: true,
      data: resultJson
    });
  } catch (error: any) {
    console.error('Error in scan-pot API:', error);
    return res.status(500).json({
      error: 'SCAN_FAILED',
      message: error.message || 'Error al procesar la captura de la olla.'
    });
  }
}
