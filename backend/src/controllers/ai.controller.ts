import { Request, Response } from 'express';
import { config } from '../config/index.js';

interface MistakeExplanation {
  original: string;
  replacement: string;
  rule: string;
  explanation: string;
}

interface AICorrectionResult {
  originalText: string;
  correctedText: string;
  score: number; // 0-100 rating
  mistakes: MistakeExplanation[];
  vocabularySuggestions: Array<{ word: string; betterAlternatives: string[]; reason: string }>;
  overallFeedback: string;
  isMock: boolean;
}

// Fallback Rule-Based Grammar & Style Engine
function mockGrammarChecker(text: string): AICorrectionResult {
  let corrected = text.trim();
  const mistakes: MistakeExplanation[] = [];
  const vocabularySuggestions: Array<{ word: string; betterAlternatives: string[]; reason: string }> = [];

  const rules: Array<{ pattern: RegExp; replacement: string; rule: string; explanation: string }> = [
    {
      pattern: /\bi am agree\b/gi,
      replacement: 'I agree',
      rule: 'Verb Collocation',
      explanation: '"Agree" is an active verb, not an adjective. Do not use "am agree".'
    },
    {
      pattern: /\balot\b/gi,
      replacement: 'a lot',
      rule: 'Spelling Error',
      explanation: '"A lot" is always two separate words.'
    },
    {
      pattern: /\bhe go\b/gi,
      replacement: 'he goes',
      rule: 'Subject-Verb Agreement',
      explanation: 'Singular third-person subject "he" requires the third-person verb form "goes".'
    },
    {
      pattern: /\bshe go\b/gi,
      replacement: 'she goes',
      rule: 'Subject-Verb Agreement',
      explanation: 'Singular third-person subject "she" requires the third-person verb form "goes".'
    },
    {
      pattern: /\bi have saw\b/gi,
      replacement: 'I have seen',
      rule: 'Present Perfect Tense',
      explanation: 'Present perfect uses "have/has + past participle (V3)". The past participle of see is "seen".'
    },
    {
      pattern: /\bi didn't went\b/gi,
      replacement: "I didn't go",
      rule: 'Past Simple Auxiliary',
      explanation: 'After auxiliary "didn\'t", always use base form (bare infinitive) "go".'
    },
    {
      pattern: /\bmore better\b/gi,
      replacement: 'better / much better',
      rule: 'Double Comparative',
      explanation: '"Better" is already the comparative form of "good". Never use "more better".'
    },
    {
      pattern: /\binterested with\b/gi,
      replacement: 'interested in',
      rule: 'Preposition Usage',
      explanation: 'The adjective "interested" takes the preposition "in".'
    }
  ];

  for (const r of rules) {
    if (r.pattern.test(corrected)) {
      mistakes.push({
        original: text.match(r.pattern)?.[0] || '',
        replacement: r.replacement,
        rule: r.rule,
        explanation: r.explanation
      });
      corrected = corrected.replace(r.pattern, r.replacement);
    }
  }

  // Capitalize first letter if needed
  if (corrected.length > 0 && corrected[0] !== corrected[0].toUpperCase()) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
  }

  // Ensure trailing punctuation
  if (!/[.!?]$/.test(corrected)) {
    corrected += '.';
  }

  // Suggest advanced academic vocabulary
  if (/\bgood\b/i.test(text)) {
    vocabularySuggestions.push({
      word: 'good',
      betterAlternatives: ['beneficial', 'advantageous', 'favorable', 'productive'],
      reason: 'Use more precise academic vocabulary to strengthen your argument.'
    });
  }
  if (/\bimportant\b/i.test(text)) {
    vocabularySuggestions.push({
      word: 'important',
      betterAlternatives: ['crucial', 'essential', 'paramount', 'significant'],
      reason: 'Using richer adjectives elevates the formality of your writing.'
    });
  }

  // Score calculation
  const baseScore = 95 - mistakes.length * 15;
  const score = Math.max(50, Math.min(100, baseScore));

  let overallFeedback = 'Excellent writing! Your ideas are clearly conveyed with accurate syntax.';
  if (mistakes.length === 1) {
    overallFeedback = 'Good effort! Pay close attention to basic verb forms and prepositions.';
  } else if (mistakes.length > 1) {
    overallFeedback = 'Your message is understandable, but several grammatical inaccuracies should be revised.';
  }

  return {
    originalText: text,
    correctedText: corrected,
    score,
    mistakes,
    vocabularySuggestions,
    overallFeedback,
    isMock: true
  };
}

export const aiController = {
  async correctWriting(req: Request, res: Response): Promise<void> {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Please provide an English text to review' });
        return;
      }

      if (text.length > 1500) {
        res.status(400).json({ success: false, message: 'Text exceeds maximum length of 1500 characters' });
        return;
      }

      // If Gemini API Key is configured, attempt call with timeout
      if (config.geminiApiKey) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const prompt = `Act as an expert English writing tutor. Analyze this student paragraph:
"${text}"

Respond ONLY with valid JSON in this exact structure:
{
  "correctedText": "string",
  "score": number (0-100),
  "mistakes": [
    { "original": "string", "replacement": "string", "rule": "string", "explanation": "string" }
  ],
  "vocabularySuggestions": [
    { "word": "string", "betterAlternatives": ["string", "string"], "reason": "string" }
  ],
  "overallFeedback": "string"
}`;

          const aiResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' }
              })
            }
          );
          clearTimeout(timeoutId);

          if (aiResp.ok) {
            const data: any = await aiResp.json();
            const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawContent) {
              const parsed = JSON.parse(rawContent);
              res.json({
                success: true,
                data: {
                  ...parsed,
                  originalText: text,
                  isMock: false
                }
              });
              return;
            }
          }
        } catch (apiErr) {
          console.warn('⚠️ Gemini API unavailable, falling back to Pedagogical Mock Engine.');
        }
      }

      // Fallback engine
      const mockResult = mockGrammarChecker(text);
      res.json({
        success: true,
        data: mockResult
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'AI service error' });
    }
  }
};
