import type { NextApiRequest, NextApiResponse } from 'next';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, history } = req.body;

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
        chatHistory: history.map((msg: Message) => ({
          role: msg.role,
          message: msg.content
        })),
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
