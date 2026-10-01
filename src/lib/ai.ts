import { IdentificationResult, DiagnosisResult, CareInfo } from '../types';
import { getSettings } from './storage';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Prefer a strong free vision model; fall back to router
const DEFAULT_MODEL = 'google/gemma-4-31b-it:free';

async function callOpenRouter(
  messages: any[],
  model?: string
): Promise<string> {
  const settings = getSettings();
  const apiKey = settings.openRouterApiKey;

  if (!apiKey) {
    throw new Error('Please add your free OpenRouter API key in Settings.');
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Plantree'
    },
    body: JSON.stringify({
      model: model || settings.preferredModel || DEFAULT_MODEL,
      messages,
      max_tokens: 2500,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401) {
      throw new Error('Invalid OpenRouter key (401). Go to Settings, paste your new key, and Save.');
    }
    if (response.status === 429) {
      throw new Error('Daily free limit reached (50 requests/day on OpenRouter free tier). It resets every day, or add $10 credits on openrouter.ai to unlock 1,000 free requests/day. We only use free models.');
    }
    // If specific model fails, try the free router once
    if (response.status === 404 && !model) {
      return callOpenRouter(messages, 'openrouter/free');
    }
    throw new Error(`OpenRouter error: ${response.status} – ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function extractJSON(text: string): any {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (match) {
    try {
      return JSON.parse(match[1].trim());
    } catch {}
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function identifyPlant(imageBase64: string): Promise<IdentificationResult> {
  const prompt = `You are an expert botanist, horticulturist and plant identifier with deep knowledge of houseplants and garden plants.

Carefully study the plant in this photo. Look at leaf shape, arrangement, trunk/stem, growth habit, and any distinctive features.

Return ONLY a valid JSON object (no markdown outside the JSON, no extra commentary) with this exact structure:

{
  "name": "Most common English name (e.g. Money Tree)",
  "scientificName": "Full scientific name (e.g. Pachira aquatica)",
  "confidence": 0.85,
  "commonNames": ["Guiana chestnut", "Malabar chestnut", "other names"],
  "description": "2-4 sentence description covering appearance, origin if known, and why people grow it.",
  "care": {
    "light": "Detailed light needs (e.g. Bright indirect light. Avoid harsh direct midday sun which can scorch leaves.)",
    "water": "Detailed watering guidance (e.g. Water thoroughly when the top 2-3 cm of soil feels dry. Do not let the pot sit in standing water. In winter water less frequently.)",
    "humidity": "Humidity preference and tips",
    "soil": "Best soil mix and drainage needs",
    "temperature": "Ideal temperature range and cold sensitivity",
    "fertilizing": "When and how to feed, and recommended type of fertilizer",
    "pruning": "How and when to prune or shape",
    "repotting": "How often to repot and pot size guidance",
    "tips": [
      "Practical tip 1",
      "Practical tip 2",
      "Practical tip 3",
      "Common problem to watch for and how to fix it"
    ]
  },
  "alternatives": [
    {"name": "Possible lookalike", "confidence": 0.2}
  ]
}

Rules:
- Be as specific and accurate as possible. Prefer the most widely used common name.
- If you recognize it clearly (e.g. Money Tree / Pachira aquatica, Snake Plant, Monstera), set confidence high (0.8–0.95).
- Only use "Unknown plant" if you truly cannot identify it; even then give your best guess in alternatives.
- Care advice must be practical, thorough and beginner-friendly.
- Return valid JSON only.`;

  const content = await callOpenRouter([
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: imageBase64.startsWith('data:')
              ? imageBase64
              : `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ]
    }
  ]);

  const parsed = extractJSON(content);

  if (parsed && parsed.name && parsed.name.toLowerCase() !== 'unknown plant') {
    // Ensure care object exists with sensible defaults
    if (!parsed.care) {
      parsed.care = {
        light: 'Bright indirect light',
        water: 'Water when the top of the soil feels dry'
      };
    }
    return parsed as IdentificationResult;
  }

  // Second attempt: simpler prompt asking for plain identification
  const retryContent = await callOpenRouter([
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Identify this plant. Reply with JSON only:
{"name":"common name","scientificName":"scientific name if known","confidence":0.0-1.0,"description":"short description","care":{"light":"...","water":"...","humidity":"...","soil":"...","fertilizing":"...","tips":["...","..."]}}`
        },
        {
          type: 'image_url',
          image_url: {
            url: imageBase64.startsWith('data:')
              ? imageBase64
              : `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ]
    }
  ], 'openrouter/free');

  const retryParsed = extractJSON(retryContent);
  if (retryParsed && retryParsed.name) {
    return retryParsed as IdentificationResult;
  }

  // Last resort: surface whatever text we got so the user isn't stuck
  return {
    name: 'Unknown plant',
    confidence: 0.3,
    description:
      content.slice(0, 400) ||
      'Could not confidently identify this plant. Try a closer photo of the leaves and stem.',
    care: {
      light: 'Bright indirect light',
      water: 'Water when top soil is dry',
      tips: [
        'Take a clearer close-up of the leaves and the base of the plant',
        'Good natural light helps identification a lot'
      ]
    }
  };
}

export async function diagnosePlant(imageBase64: string, plantName?: string): Promise<DiagnosisResult> {
  const prompt = `You are an expert plant pathologist and plant doctor. Analyze this photo of a plant${plantName ? ` (suspected: ${plantName})` : ''}.

Look carefully for disease, pests, nutrient deficiency, over/under watering, light stress, leaf damage, etc.

Return ONLY a valid JSON object:
{
  "plantName": "best guess if possible",
  "issues": [
    {
      "name": "e.g. Overwatering / Root rot risk",
      "severity": "low" | "medium" | "high",
      "description": "what you observe",
      "causes": ["possible causes"]
    }
  ],
  "recoverySteps": [
    "Step 1: clear actionable instruction",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "preventionTips": ["tip1", "tip2"],
  "confidence": 0.0-1.0
}

Be practical, thorough and gentle. If the plant looks healthy, say so clearly.`;

  const content = await callOpenRouter([
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: {
            url: imageBase64.startsWith('data:')
              ? imageBase64
              : `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ]
    }
  ]);

  const parsed = extractJSON(content);
  if (!parsed) {
    return {
      issues: [
        {
          name: 'Analysis incomplete',
          severity: 'low',
          description: content.slice(0, 300) || 'Could not parse diagnosis.'
        }
      ],
      recoverySteps: [
        'Try a clearer close-up of the affected leaves or soil.',
        'Ensure good lighting when taking the photo.'
      ]
    };
  }
  return parsed as DiagnosisResult;
}

export async function getCareAdvice(plantName: string, question?: string): Promise<string> {
  const prompt = `You are a friendly personal horticulturist and plant care expert.
Give clear, thorough, step-by-step care advice for: ${plantName}.
${question ? `Specific question: ${question}` : 'Cover watering, light, soil, humidity, feeding, pruning, repotting, common problems, and tips for beginners in detail.'}
Keep the tone encouraging and practical. Use numbered steps and short paragraphs.`;

  return callOpenRouter([{ role: 'user', content: prompt }]);
}
