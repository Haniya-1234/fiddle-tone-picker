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

  const { text, formality, emotion } = req.body;

  if (!text || !formality || !emotion) {
    return res.status(400).json({
      error: 'Missing required fields: text, formality, emotion'
    });
  }

  try {
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small',
        messages: [{ 
          role: 'user', 
          content: `You are a professional tone-adjustment assistant.
Rewrite the following text with:
Formality = ${formality}
Emotion = ${emotion}
Text: "${text}"
Rules:
- Keep meaning the same.
- Do not add/remove content.
- Return only rewritten text.` 
        }],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const rewrittenText = response.data.choices[0].message.content.trim();

    res.json({ 
      rewrittenText,
      cached: false
    });
  } catch (error) {
    console.error('Error calling Mistral AI:', error);
    
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
