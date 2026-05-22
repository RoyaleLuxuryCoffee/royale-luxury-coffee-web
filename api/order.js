require('dotenv').config();
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
});

const products = [
  { id: 'black-heron-340g', name: 'The Black Heron — Garza Negra', priceCOP: 30000 }
];

const ALLOWED_ORIGINS = [
  'https://royaleluxurycoffee.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

function validateCustomer(customer) {
  if (!customer || typeof customer !== 'object') return 'Datos del cliente inválidos';
  const { name, address, city, department, phone, email } = customer;
  if (!name    || name.length    > 100) return 'Nombre inválido';
  if (!address || address.length > 200) return 'Dirección inválida';
  if (!city    || city.length    > 100) return 'Ciudad inválida';
  if (!department)                      return 'Departamento inválido';
  if (!phone || !/^\+?\d{7,15}$/.test(phone.replace(/\s/g, ''))) return 'Teléfono inválido';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))       return 'Email inválido';
  return null;
}

module.exports = async function handler(req, res) {
  console.log(`🔔 /api/order — ${req.method} | origin: ${req.headers.origin || 'none'}`);
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).end();

  try {
    const { productId, quantity, cadence, customer } = req.body;

    const customerError = validateCustomer(customer);
    if (customerError) {
      console.log(`❌ Validación fallida: ${customerError}`, JSON.stringify(customer));
      return res.status(400).json({ success: false, error: customerError });
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    const cant = Math.min(Math.max(parseInt(quantity) || 1, 1), 10);
    const discountRate = cadence === 'sub' ? 0.12 : 0;
    const unitPrice    = Math.round(product.priceCOP * (1 - discountRate));
    const totalAmount  = unitPrice * cant;
    const reference    = `ROYALE-${Date.now()}`;

    console.log(`📦 ${product.name} x${cant} | ref: ${reference}`);

    await redis.set(reference, {
      reference,
      product:  product.name,
      quantity: cant,
      amount:   totalAmount,
      customer,
      createdAt: new Date().toISOString()
    }, { ex: 7200 });

    const boldRes = await fetch('https://integrations.api.bold.co/online/link/v1', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `x-api-key ${process.env.BOLD_API_KEY}`
      },
      body: JSON.stringify({
        amount_type:  'CLOSE',
        amount:       { currency: 'COP', total_amount: totalAmount },
        description:  `Royale: ${product.name} x${cant}`.slice(0, 100),
        reference,
        redirect_url: process.env.REDIRECT_URL || 'https://royaleluxurycoffee.com/thanks.html'
      })
    });

    const data = await boldRes.json();

    if (!boldRes.ok) {
      console.error('❌ Bold error:', boldRes.status);
      await redis.del(reference);
      return res.status(502).json({ success: false, error: 'Error al generar el link de pago' });
    }

    return res.json({ success: true, paymentUrl: data.payload?.url || data.url });

  } catch (err) {
    console.error('Error /api/order:', err.message);
    return res.status(500).json({ success: false, error: 'Fallo interno' });
  }
};
