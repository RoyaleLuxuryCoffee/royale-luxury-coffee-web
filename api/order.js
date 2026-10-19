const crypto = require('crypto');
const { Resend } = require('resend');

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

const products = [
  { id: 'black-heron-340g',   name: 'The Black Heron — Garza Negra',    priceCOP: 30000 },
  { id: 'immortal-heron-340g', name: 'The Immortal Heron — Garza Inmortal', priceCOP: 30000 }
];

function validateCustomer(customer) {
  if (!customer || typeof customer !== 'object') return 'Datos del cliente inválidos';
  const { name, address, city, department, phone, email } = customer;
  if (!name     || name.length     > 100) return 'Nombre inválido';
  if (!address  || address.length  > 200) return 'Dirección inválida';
  if (!city     || city.length     > 100) return 'Ciudad inválida';
  if (!department)                        return 'Departamento inválido';
  if (!phone || !/^\+?\d{7,15}$/.test(phone.replace(/\s/g, ''))) return 'Teléfono inválido';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))       return 'Email inválido';
  return null;
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { productId, quantity, cadence, customer } = req.body;

    const customerError = validateCustomer(customer);
    if (customerError) return res.status(400).json({ success: false, error: customerError });

    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ success: false, error: 'Producto no encontrado' });

    const cant         = Math.min(Math.max(parseInt(quantity) || 1, 1), 10);
    const discountRate = cadence === 'sub' ? 0.12 : 0;
    const unitPrice    = Math.round(product.priceCOP * (1 - discountRate));
    const totalAmount  = unitPrice * cant;
    const reference    = `LERON-${Date.now()}`;

    const boldBody = {
      amount_type:  'CLOSE',
      amount:       { currency: 'COP', total_amount: totalAmount },
      description:  `Leron: ${product.name} x${cant} — ${customer.name}`.slice(0, 100),
      reference,
      redirect_url: process.env.REDIRECT_URL || 'https://royalluxurycoffee.com/thanks.html'
    };

    const boldRes  = await fetch('https://integrations.api.bold.co/online/link/v1', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.BOLD_API_KEY}`
      },
      body: JSON.stringify(boldBody)
    });

    const data = await boldRes.json();
    console.log('Bold status:', boldRes.status, data);

    if (!boldRes.ok) {
      return res.status(502).json({ success: false, error: 'Error al generar el link de pago' });
    }

    const paymentUrl = data.payload?.url || data.url || data.payment_url || data.link;

    // Email notifications (non-blocking)
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const order  = { reference, product: product.name, quantity: cant, amount: totalAmount, customer };
      await Promise.allSettled([
        resend.emails.send({
          from:    process.env.LERON_EMAIL_FROM || 'Leron <orders@leroncoffee.com>',
          to:      customer.email,
          subject: `Su orden Leron está confirmada — Ref. ${reference}`,
          html:    `<p>Orden ${reference} confirmada por $${totalAmount.toLocaleString('es-CO')} COP.</p>`
        }),
        process.env.LERON_OWNER_EMAIL ? resend.emails.send({
          from:    process.env.LERON_EMAIL_FROM || 'Leron <orders@leroncoffee.com>',
          to:      process.env.LERON_OWNER_EMAIL,
          subject: `Nuevo pedido — ${customer.name} — $${totalAmount.toLocaleString('es-CO')} COP`,
          html:    `<p>${customer.name} · ${customer.email} · ${customer.phone}<br>${product.name} x${cant}<br>Ref: ${reference}</p>`
        }) : Promise.resolve()
      ]);
    } catch (e) { console.error('Email error:', e); }

    res.json({ success: true, paymentUrl });

  } catch (error) {
    console.error('Error /api/order:', error);
    res.status(500).json({ success: false, error: 'Fallo interno' });
  }
};
