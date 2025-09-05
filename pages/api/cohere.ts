import type { NextApiRequest, NextApiResponse } from 'next';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, history } = req.body as {
    prompt: string;
    history: Message[];
  };

  // Now you can safely use msg.content
  const formattedHistory = history.map((msg) => ({
    role: msg.role,
    message: msg.content
  }));

  // ... continue with your Cohere API call
}
