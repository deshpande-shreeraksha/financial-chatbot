import type { NextApiRequest, NextApiResponse } from 'next';
import { getCohereResponse } from '../../lib/cohereService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  try {
    const reply = await getCohereResponse(prompt);
    res.status(200).json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch response from Cohere' });
  }
}
