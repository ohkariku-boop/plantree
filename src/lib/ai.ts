import { IdentificationResult, DiagnosisResult, CareInfo } from '../types';
import { getSettings } from './storage';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free multimodal-capable models on OpenRouter (as of 2025/2026)
// Users can change preferred model in settings
const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free'; // or 'meta-llama/llama-3.2-11b-vision-instruct:free' etc.

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
      max_tokens: 1500,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter error: ${response.status} – ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function extractJSON(text: string): any {
  // Try to find JSON block
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
  const prompt = `You are an expert botanist and horticulturist. Analyze this plant photo.

Return ONLY a valid JSON object with this exact structure (no extra text):
{
  "name": "Common name",
  "scientificName": "Scientific name if known",
  "confidence": 0.0 to 1.0,
  "commonNames": ["other common names"],
  "description": "Short 1-2 sentence description",
  "care": {
    "light": "e.g. Bright indirect light",
    "water": "e.g. Water when top 2-3cm of soil is dry",
    "humidity": "optional",
    "soil": "optional",
    "temperature": "optional",
    "fertilizing": "optional",
    "pruning": "optional",
    "repotting": "optional",
    "tips": ["tip1", "tip2"]
  },
  "alternatives": [{"name": "...", "confidence": 0.x}]
}

Be accurate. If unsure, lower confidence and list alternatives. Focus on houseplants and common garden plants.`;

  const content = await callOpenRouter([
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
        }
      ]
    }
  ]);

  const parsed = extractJSON(content);
  if (!parsed || !parsed.name) {
    // Fallback parse
    return {
      name: 'Unknown plant',
      confidence: 0.3,
      description: content.slice(0, 300),
      care: {
        light: 'Bright indirect light',
        water: 'Water when top soil is dry'
      }
    };
  }
  return parsed as IdentificationResult;
}

export async function diagnosePlant(imageBase64: string, plantName?: string): Promise<DiagnosisResult> {
  const prompt = `You are an expert plant pathologist and plant doctor. Analyze this photo of a plant${plantName ? ` (suspected: ${plantName})` : ''}.

Look for signs of disease, pests, nutrient deficiency, over/under watering, light stress, etc.

Return ONLY a valid JSON object:
{
  "plantName": "best guess if possible",
  "issues": [
    {
      "name": "e.g. Overwatering / Root rot risk",
      "severity": "low" | "medium" | "high",
      "description": "what you see",
      "causes": ["possible causes"]
    }
  ],
  "recoverySteps": [
    "Step 1: clear actionable instruction",
    "Step 2: ...",
    "..."
  ],
  "preventionTips": ["tip1", "tip2"],
  "confidence": 0.0-1.0
}

Be practical, gentle, and step-by-step. Prioritize the most likely issues. If the plant looks healthy, say so.`;

  const content = await callOpenRouter([
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image_url',
          image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
        }
      ]
    }
  ]);

  const parsed = extractJSON(content);
  if (!parsed) {
    return {
      issues: [{ name: 'Analysis incomplete', severity: 'low', description: content.slice(0, 200) }],
      recoverySteps: ['Try a clearer photo of the affected area.', 'Ensure good lighting on the leaves and soil.']
    };
  }
  return parsed as DiagnosisResult;
}

export async function getCareAdvice(plantName: string, question?: string): Promise<string> {
  const prompt = `You are a friendly personal horticulturist and plant care expert.
Give clear, practical, step-by-step care advice for: ${plantName}.
${question ? `Specific question: ${question}` : 'Cover watering, light, soil, feeding, pruning, common problems, and tips for beginners.'}
Keep the tone encouraging and simple. Use bullet points or numbered steps where helpful.`;

  return callOpenRouter([{ role: 'user', content: prompt }]);
}
