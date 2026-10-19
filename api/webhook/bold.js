const crypto = require('crypto');
const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    if (process.env.BOLD_WEBHOOK_SECRET) {
      const sig      = req.headers['x-bold-signature'] || '';
      const raw      = JSON.stringify(req.body);
      const expected = crypto.createHmac('sha256', process.env.BOLD_WEBHOOK_SECRET).update(raw).digest('hex');
      if (sig !== expected) return res.sendStatus(401);
    }

    const { status, reference, amount, currency } = req.body;
    if (status !== 'APPROVED') return res.sendStatus(200);

    console.log(`✅ PAGO APROBADO — ${reference}`);

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
};
