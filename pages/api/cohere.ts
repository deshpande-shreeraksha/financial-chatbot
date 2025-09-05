import type { NextApiRequest, NextApiResponse } from 'next';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, history, tone, role } = req.body as {
    prompt: string;
    history: Message[];
    tone?: 'formal' | 'casual';
    role?: 'advisor' | 'analyst' | 'officer';
  };
  
  
  
  const formattedHistory = history.map((msg) => ({
    role: msg.role,
    message: msg.content
  }));

  const systemPrompt =
    role === 'advisor'
      ? tone === 'formal'
        ? 'You are a professional financial advisor. Respond formally and clearly.'
        : 'You are a friendly financial advisor. Use casual, helpful language.'
      : `You are a ${role} assisting users with financial questions.`;
      
      
      body: JSON.stringify({
        model: 'command-r-plus',
        message: prompt,
        chatHistory: formattedHistory,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 300
      })
      

  try {
    const response = await fetch('https://api.cohere.ai/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        message: prompt,
        chatHistory: formattedHistory,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 300
      })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch response from Cohere' });
  }
}
