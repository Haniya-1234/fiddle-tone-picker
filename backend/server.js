require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://fiddle-tone-picker-g9l2.vercel.app',
    'https://fiddle-tone-picker.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
    const prompt = `You are a tone analysis expert. Analyze the tone of the following text and respond ONLY with valid JSON in this exact format:

{
  "currentTone": {
    "formality": "Casual",
    "emotion": "Friendly",
    "description": "This text uses casual language with a friendly, approachable tone."
  },
  "suggestions": [
    {
      "formality": "Formal",
      "emotion": "Polite",
      "reason": "This would make it more professional and respectful for business contexts."
    },
    {
      "formality": "Neutral",
      "emotion": "Neutral",
      "reason": "This would create a balanced, professional tone that's neither too casual nor too formal."
    },
    {
      "formality": "Casual",
      "emotion": "Polite",
      "reason": "This would maintain approachability while adding politeness and respect."
    }
  ]
}

Text to analyze: "${text}"

Remember: Respond ONLY with the JSON, no additional text or explanations.`;

    // Call Mistral API for tone detection
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-small',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.1, // Lower temperature for more consistent JSON
        response_format: { type: "json_object" }, // Request JSON format
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
      
      // Clean the content to extract JSON
      let jsonContent = content;
      
      // If response contains markdown code blocks, extract JSON from them
      if (content.includes('```json')) {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1].trim();
        }
      } else if (content.includes('```')) {
        // Extract content between any code blocks
        const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonContent = codeMatch[1].trim();
        }
      }
      
      // Try to find JSON object in the content
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      toneAnalysis = JSON.parse(jsonContent);
      
      // Validate the structure
      if (!toneAnalysis.currentTone || !toneAnalysis.suggestions || !Array.isArray(toneAnalysis.suggestions)) {
        throw new Error('Invalid response structure');
      }
      
    } catch (parseError) {
      // If JSON parsing fails, create a fallback analysis
      console.warn('Failed to parse tone detection response as JSON, using fallback. Response:', response.data.choices[0].message.content);
      
      // Try to extract tone information from the text response
      const content = response.data.choices[0].message.content.toLowerCase();
      let detectedFormality = 'Neutral';
      let detectedEmotion = 'Neutral';
      
      // Simple keyword-based fallback detection
      if (content.includes('casual') || content.includes('informal') || content.includes('relaxed')) {
        detectedFormality = 'Casual';
      } else if (content.includes('formal') || content.includes('professional') || content.includes('business')) {
        detectedFormality = 'Formal';
      }
      
      if (content.includes('friendly') || content.includes('warm') || content.includes('approachable')) {
        detectedEmotion = 'Friendly';
      } else if (content.includes('polite') || content.includes('respectful') || content.includes('courteous')) {
        detectedEmotion = 'Polite';
      }
      
      toneAnalysis = {
        currentTone: {
          formality: detectedFormality,
          emotion: detectedEmotion,
          description: `AI detected ${detectedFormality.toLowerCase()} formality with ${detectedEmotion.toLowerCase()} emotion.`
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
