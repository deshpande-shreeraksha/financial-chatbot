import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { rating, timestamp } = req.body;
  console.log('Feedback received:', rating, timestamp);
  res.status(200).json({ success: true });
}
