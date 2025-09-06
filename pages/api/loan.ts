import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { amount, rate, years } = req.body;

  if (!amount || !rate || !years) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const r = rate / 12 / 100;
  const n = years * 12;
  const emi = (amount * r) / (1 - Math.pow(1 + r, -n));

  res.status(200).json({ emi: emi.toFixed(2) });
}
