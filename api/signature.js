const crypto = require('crypto');

const allowedOrigins = [
  'https://royalluxurycoffee.com',
  'https://leroncoffee.com'
];

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { orderId, amount, currency = 'COP' } = req.body;
  if (!orderId || !amount) return res.status(400).json({ error: 'orderId y amount requeridos' });

  const secret = process.env.BOLD_WEBHOOK_SECRET;
  const data   = `${orderId}${amount}${currency}${secret}`;
  const sig    = crypto.createHash('sha256').update(data).digest('hex');

  res.json({ signature: sig });
};
