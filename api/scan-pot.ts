// Vercel Serverless Function: POST /api/scan-pot
// Analyzes Pokémon Sleep cooking pot / ingredient inventory screenshots using Gemini 3.5 Flash-Lite Vision

let cachedWinningPotModel: string | null = null;

const DEFAULT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-flash-latest'
];

const POT_SYSTEM_PROMPT = `Extract Pokémon Sleep cooking pot & ingredient stock from the image(s) into JSON.
Rules:
- potCapacity: second integer Y in "Añadido: X/Y" or "Added: X/Y" (default 57 if hidden); currentAdded = X.
- dishType: "curry", "salad", or "dessert" if visible, else null.
- ingredients: read every ingredient card in the grid. Counter "A/B" means available quantity = B (the denominator AFTER the slash!). Deduplicate across scrolled views.
Canonical Spanish names: Puerro Grueso, Seta Sabrosa, Huevo Selecto, Patata, Manzana Selecta, Hierba Picante, Fiambre Vegetariano, Leche Mu-mu, Miel, Aceite Puro, Jengibre, Siestomate, Cacao Relajante, Cola de Slowpoke, Soja Verdegal, Maíz Verdegal, Café Estimulante, Calabaza Suculenta, Aguacate.`;

const POT_OCR_SCHEMA = {
  type: 'OBJECT',
  properties: {
    potCapacity: { type: 'INTEGER' },
    currentAdded: { type: 'INTEGER' },
    dishType: { type: 'STRING', nullable: true },
    ingredients: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          quantity: { type: 'INTEGER' }
        },
        required: ['name', 'quantity']
      }
    }
  },
  required: ['potCapacity', 'ingredients']
};

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function buildGenerationConfig(model: string, minimalFallback = false) {
  if (minimalFallback) {
    return { responseMimeType: 'application/json' };
  }
  const lower = model.toLowerCase();
  const isLite = lower.includes('lite');
  const config: Record<string, any> = {
    responseMimeType: 'application/json',
    maxOutputTokens: isLite ? 900 : 1400,
    responseSchema: POT_OCR_SCHEMA
  };
  if (!isLite) {
    if (/gemini-3/.test(lower)) {
      config.thinkingConfig = { thinkingLevel: 'minimal' };
    } else if (/gemini-2\.5/.test(lower)) {
      config.thinkingConfig = { thinkingBudget: 0 };
    }
  }
  return config;
}

function extractSuggestedModel(errMsg: string, failedModel: string): string | null {
  const regex = /models\/(gemini-[a-z0-9.-]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(errMsg || '')) !== null) {
    const candidate = match[1].replace(/\.$/, '');
    if (
      candidate &&
      candidate !== failedModel &&
      !candidate.includes('2.5-flash-lite') &&
      !candidate.includes('2.5-flash') &&
      !candidate.includes('2.0-') &&
      !candidate.includes('1.5-')
    ) {
      return candidate;
    }
  }
  return null;
}

function filterVisionModels(modelsList: any[]): string[] {
  const excluded = [
    '2.5-flash-lite', '2.5-flash', '2.0-', '1.5-', '1.0-', 'embedding', 'aqa', 'imagen', 'learnlm',
    'tts', 'audio', 'live', 'thinking', 'robotics', 'computer-use',
    'image', 'veo', 'gemma', 'pro', 'customtools'
  ];
  const valid = modelsList
    .filter((m: any) => {
      const name = String(m?.name || '').replace(/^models\//, '').toLowerCase();
      const methods: string[] = m?.supportedGenerationMethods || [];
      return (
        methods.includes('generateContent') &&
        name.startsWith('gemini-') &&
        name.includes('flash') &&
        !excluded.some((tok) => name.includes(tok))
      );
    })
    .map((m: any) => String(m.name).replace(/^models\//, ''));

  valid.sort((a, b) => {
    const aL = a.toLowerCase();
    const bL = b.toLowerCase();
    const aLite = aL.includes('lite') ? 1 : 0;
    const bLite = bL.includes('lite') ? 1 : 0;
    if (bLite !== aLite) return bLite - aLite;
    const aStable = !aL.includes('preview') && !aL.includes('exp') ? 1 : 0;
    const bStable = !bL.includes('preview') && !bL.includes('exp') ? 1 : 0;
    if (bStable !== aStable) return bStable - aStable;
    const vA = parseFloat((aL.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || '0');
    const vB = parseFloat((bL.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || '0');
    return vB - vA;
  });

  return Array.from(new Set(valid)).slice(0, 3);
}

function extractJsonFromCandidate(data: any): any {
  const parts: any[] = data?.candidates?.[0]?.content?.parts || [];
  let rawText = '';
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i] && !parts[i].thought && typeof parts[i].text === 'string' && parts[i].text.trim()) {
      rawText = parts[i].text;
      break;
    }
  }
  if (!rawText && typeof parts[0]?.text === 'string') rawText = parts[0].text;
  if (!rawText) throw new Error('Respuesta vacía del modelo Gemini.');

  const stripped = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const start = stripped.indexOf('{');
    const end = stripped.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(stripped.slice(start, end + 1));
    throw new Error('JSON inválido devuelto por Gemini.');
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido. Usa POST.' });

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

    const apiKey = (
      userApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      ''
    ).trim();

    if (!apiKey) {
      return res.status(401).json({
        error: 'MISSING_API_KEY',
        message:
          'Se requiere una API Key de Google AI Studio (Gemini Flash-Lite). Configúrala en el servidor o ingrésala en la app.'
      });
    }

    const cleanImages = rawImages.map((img) => img.replace(/^data:image\/[a-zA-Z]+;base64,/, ''));

    const queue: string[] = cachedWinningPotModel
      ? [cachedWinningPotModel, ...DEFAULT_MODELS.filter((m) => m !== cachedWinningPotModel)]
      : [...DEFAULT_MODELS];
    const tried = new Set<string>();
    let catalogQueried = false;
    let lastError: any = null;
    let resultJson: any = null;
    let attempts = 0;

    while (queue.length > 0 && attempts < 4 && !resultJson) {
      const model = queue.shift()!;
      if (!model || tried.has(model)) continue;
      tried.add(model);
      attempts++;

      for (const minimalFallback of [false, true]) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const response = await fetchWithTimeout(
            url,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: POT_SYSTEM_PROMPT },
                      ...cleanImages.map((data) => ({
                        inline_data: { mime_type: mimeType, data }
                      }))
                    ]
                  }
                ],
                generationConfig: buildGenerationConfig(model, minimalFallback)
              })
            },
            12000
          );

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg: string = errData?.error?.message || `HTTP ${response.status}`;
            const lowerMsg = errMsg.toLowerCase();

            if (
              response.status === 401 ||
              response.status === 403 ||
              lowerMsg.includes('api_key_invalid') ||
              lowerMsg.includes('api key not valid')
            ) {
              return res.status(401).json({
                error: 'INVALID_API_KEY',
                message: 'API Key de Google AI Studio inválida o sin permisos.'
              });
            }

            const isHighDemand =
              response.status === 503 ||
              lowerMsg.includes('high demand') ||
              lowerMsg.includes('spikes in demand') ||
              lowerMsg.includes('overloaded');

            if (
              !isHighDemand &&
              (response.status === 429 || lowerMsg.includes('quota') || lowerMsg.includes('resource_exhausted'))
            ) {
              return res.status(429).json({
                error: 'QUOTA_EXCEEDED',
                message: 'Límite por minuto alcanzado en Google AI Studio. Intenta de nuevo en unos segundos.'
              });
            }

            if (
              !minimalFallback &&
              response.status === 400 &&
              (lowerMsg.includes('responseschema') || lowerMsg.includes('thinking') || lowerMsg.includes('unknown name'))
            ) {
              continue;
            }

            if (isHighDemand && cachedWinningPotModel === model) {
              cachedWinningPotModel = null;
            }

            if (
              lowerMsg.includes('no longer available') ||
              lowerMsg.includes('not found') ||
              lowerMsg.includes('deprecated') ||
              response.status === 404
            ) {
              if (cachedWinningPotModel === model) cachedWinningPotModel = null;
              const hinted = extractSuggestedModel(errMsg, model);
              if (hinted && !tried.has(hinted)) {
                queue.unshift(hinted);
              } else if (!catalogQueried) {
                catalogQueried = true;
                try {
                  const catRes = await fetchWithTimeout(
                    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
                    { method: 'GET' },
                    5000
                  );
                  if (catRes.ok) {
                    const catData = await catRes.json();
                    const dynamic = filterVisionModels(catData.models || []);
                    for (let k = dynamic.length - 1; k >= 0; k--) {
                      if (!tried.has(dynamic[k])) queue.unshift(dynamic[k]);
                    }
                  }
                } catch {
                  // ignore catalog error
                }
              }
            }

            throw new Error(errMsg);
          }

          const data = await response.json();
          resultJson = extractJsonFromCandidate(data);
          cachedWinningPotModel = model;
          break;
        } catch (err: any) {
          lastError = err;
          break;
        }
      }
    }

    if (!resultJson) {
      return res.status(502).json({
        error: 'SCAN_FAILED',
        message:
          lastError?.message ||
          'Ningún modelo de Gemini pudo procesar la captura de la olla. Verifica tu API Key o la nitidez de la imagen.'
      });
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
