import axios from 'axios';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      error: 'Text is required for tone detection'
    });
  }

  try {
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

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.1,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let toneAnalysis;
    try {
      const content = response.data.choices[0].message.content.trim();
      toneAnalysis = JSON.parse(content);
      
      // Validate the structure
      if (!toneAnalysis.currentTone || !toneAnalysis.suggestions || !Array.isArray(toneAnalysis.suggestions)) {
        throw new Error('Invalid response structure');
      }
      
    } catch (parseError) {
      // Fallback analysis if JSON parsing fails
      console.warn('Failed to parse tone detection response as JSON, using fallback');
      
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

    res.json({
      ...toneAnalysis,
      cached: false
    });

  } catch (error) {
    console.error('Error detecting tone:', error);
    
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
}
