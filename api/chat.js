export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY is not configured in server environment');
    return res.status(500).json({ error: 'El servicio de IA no está configurado.' });
  }

  const { messages, systemPrompt, userMessage } = req.body || {};

  if (!userMessage && (!messages || messages.length === 0)) {
    return res.status(400).json({ error: 'Mensaje requerido.' });
  }

  try {
    const formattedMessages = [
      { role: 'system', content: systemPrompt || 'Eres Emma, la asistente de Rentun Group.' },
      ...(Array.isArray(messages) ? messages.slice(-6).map(m => ({ role: m.role, content: m.content })) : []),
      ...(userMessage ? [{ role: 'user', content: userMessage }] : [])
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: formattedMessages,
        temperature: 0.3,
        max_tokens: 500,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API Error on server:', errText);
      return res.status(response.status).json({ error: 'Error del proveedor de IA' });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || 'Disculpa, no pude procesar tu mensaje en este momento.';

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Server error in api/chat:', error);
    return res.status(500).json({ error: 'Error interno del servidor de chat' });
  }
}

