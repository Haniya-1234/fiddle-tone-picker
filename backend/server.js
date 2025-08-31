require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Cache for API responses (5 minutes TTL)
const cache = new NodeCache({ stdTTL: 300 });

// Mistral AI configuration
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Validate API key
if (!MISTRAL_API_KEY) {
  console.error('❌ MISTRAL_API_KEY is required in environment variables');
  process.exit(1);
}

// Tone detection endpoint
app.post('/api/detect-tone', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Text is required for tone detection'
      });
    }

    // Create cache key
    const cacheKey = `detect-${text}`;
    
    // Check cache first
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return res.json({ 
        ...cachedResponse,
        cached: true 
      });
    }

    // Prompt for tone detection
    const prompt = `Analyze the tone of the following text and provide:
1. Current tone assessment (formality level + emotional tone)
2. 3 alternative tone suggestions that would work well for this content
3. Brief explanation of why each alternative would be effective

Text: "${text}"

Format your response as JSON:
{
  "currentTone": {
    "formality": "Casual|Neutral|Formal",
    "emotion": "Friendly|Neutral|Polite",
    "description": "brief description of current tone"
  },
  "suggestions": [
    {
      "formality": "Casual|Neutral|Formal",
      "emotion": "Friendly|Neutral|Polite",
      "reason": "why this tone would work well"
    }
  ]
}`;

    // Call Mistral API for tone detection
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-small',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let toneAnalysis;
    try {
      // Try to parse the response as JSON
      const content = response.data.choices[0].message.content.trim();
      toneAnalysis = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback analysis
      console.warn('Failed to parse tone detection response as JSON, using fallback');
      toneAnalysis = {
        currentTone: {
          formality: 'Neutral',
          emotion: 'Neutral',
          description: 'Unable to detect specific tone'
        },
        suggestions: [
          {
            formality: 'Casual',
            emotion: 'Friendly',
            reason: 'Make it more approachable and conversational'
          },
          {
            formality: 'Formal',
            emotion: 'Polite',
            reason: 'Increase professionalism and respect'
          },
          {
            formality: 'Neutral',
            emotion: 'Friendly',
            reason: 'Balance between casual and professional'
          }
        ]
      };
    }

    // Cache the response
    cache.set(cacheKey, toneAnalysis);
    
    res.json({
      ...toneAnalysis,
      cached: false
    });

  } catch (error) {
    console.error(' Error detecting tone:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Mistral AI API error',
        details: error.response.data
      });
    } else if (error.request) {
      res.status(500).json({ error: 'Network error - unable to reach Mistral AI' });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

// Tone adjustment endpoint
app.post('/api/tone', async (req, res) => {
  try {
    const { text, formality, emotion } = req.body;

    if (!text || !formality || !emotion) {
      return res.status(400).json({
        error: 'Missing required fields: text, formality, emotion'
      });
    }

    // Create cache key
    const cacheKey = `${text}-${formality}-${emotion}`;

    // Check cache first
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return res.json({
        rewrittenText: cachedResponse,
        cached: true
      });
    }

    // Prompt for Mistral AI
    const prompt = `You are a professional tone-adjustment assistant.
Rewrite the following text with:
Formality = ${formality}
Emotion = ${emotion}
Text: "${text}"
Rules:
- Keep meaning the same.
- Do not add/remove content.
- Return only rewritten text.`;

    // Call Mistral API
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-small',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const rewrittenText = response.data.choices[0].message.content.trim();

    // Cache response
    cache.set(cacheKey, rewrittenText);

    res.json({
      rewrittenText,
      cached: false
    });
  } catch (error) {
    console.error('❌ Error calling Mistral AI:', error);

    if (error.response) {
      res.status(error.response.status).json({
        error: 'Mistral AI API error',
        details: error.response.data
      });
    } else if (error.request) {
      res.status(500).json({ error: 'Network error - unable to reach Mistral AI' });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cacheStats: cache.getStats(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(` Backend server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
