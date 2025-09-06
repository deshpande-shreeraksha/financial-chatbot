import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { upiId } = req.body;

  if (!upiId) return res.status(400).json({ error: 'Missing UPI ID' });

  try {
    const response = await fetch('https://api.trueupi.com/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TRUEUPI_API_KEY}`
      },
      body: JSON.stringify({ upiId })
    });

    const data = await response.json();
    res.status(200).json({ risk: data.riskScore, status: data.status });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
}
