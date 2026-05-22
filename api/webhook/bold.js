require('dotenv').config();
const { Redis } = require('@upstash/redis');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Helpers de seguridad ──────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidReference(ref) {
  return typeof ref === 'string' && /^ROYALE-\d+$/.test(ref);
}

// ─── Email al cliente ──────────────────────────────────────────────────────
function clientEmailTemplate(order) {
  const name     = escapeHtml(order.customer.name);
  const product  = escapeHtml(order.product);
  const phone    = escapeHtml(order.customer.phone);
  const ref      = escapeHtml(order.reference);
  const amount   = escapeHtml(order.amount.toLocaleString('es-CO'));
  const quantity = escapeHtml(String(order.quantity));
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Su orden Royale Luxury Coffee</title>
</head>
<body style="margin:0;padding:0;background:#0A0908;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0908;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <tr>
            <td style="padding:0 0 40px;border-bottom:1px solid rgba(201,169,97,0.2);">
              <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                         font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#C9A961;">
                ROYALE LUXURY COFFEE
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 0 8px;">
              <h1 style="margin:0;font-size:28px;font-weight:400;line-height:1.2;
                          color:#F5F1E8;font-style:italic;">
                Orden confirmada.
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 32px;">
              <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                         font-size:13px;color:rgba(245,241,232,0.5);letter-spacing:0.05em;">
                Ref. ${ref}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 0 32px;">
              <p style="margin:0;font-size:16px;line-height:1.8;color:rgba(245,241,232,0.75);">
                Estimado/a ${name},
              </p>
              <p style="margin:16px 0 0;font-size:16px;line-height:1.8;color:rgba(245,241,232,0.75);">
                Su pedido <em style="color:#F5F1E8;">${product}</em> — ${quantity} × 340 g
                ha sido procesado exitosamente por un total de
                <strong style="color:#C9A961;">$${amount} COP</strong>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 0 32px;">
              <div style="height:1px;background:rgba(201,169,97,0.15);"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 0 8px;">
              <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                         font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#C9A961;">
                Despacho Preferencial
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0;font-size:15px;font-style:italic;line-height:1.85;
                          color:rgba(245,241,232,0.65);">
                Royale procesa su orden de inmediato. Su paquete será entregado por
                <em style="color:#F5F1E8;">Interrapidísimo</em> en la dirección registrada.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 0 32px;">
              <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(245,241,232,0.75);">
                Pronto recibirá un mensaje de
                <strong style="color:#F5F1E8;">WhatsApp</strong> al número
                <em style="color:#C9A961;">${phone}</em>
                con el valor exacto del flete a cancelar al mensajero en efectivo
                al momento de la entrega.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px;background:rgba(201,169,97,0.05);
                        border-left:2px solid rgba(201,169,97,0.3);">
              <p style="margin:0 0 6px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                          font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C9A961;">
                Flete Contra Entrega
              </p>
              <p style="margin:0;font-size:14px;font-style:italic;line-height:1.8;
                          color:rgba(245,241,232,0.6);">
                El costo del transporte se cancela directamente al mensajero
                en efectivo al momento de la entrega.
              </p>
            </td>
          </tr>

          <tr><td style="padding:32px 0 0;"></td></tr>
          <tr>
            <td style="padding:0 0 32px;">
              <div style="height:1px;background:rgba(201,169,97,0.15);"></div>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                          font-size:11px;color:rgba(245,241,232,0.3);line-height:1.8;">
                Garzón, Huila — Coffee as Culture<br>
                <a href="mailto:info@royaleluxurycoffee.com"
                   style="color:rgba(201,169,97,0.6);text-decoration:none;">
                  info@royaleluxurycoffee.com
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Email al dueño ────────────────────────────────────────────────────────
function ownerEmailTemplate(order) {
  const name    = escapeHtml(order.customer.name);
  const email   = escapeHtml(order.customer.email);
  const phone   = escapeHtml(order.customer.phone);
  const address = escapeHtml(order.customer.address);
  const city    = escapeHtml(order.customer.city);
  const dept    = escapeHtml(order.customer.department);
  const product = escapeHtml(order.product);
  const ref     = escapeHtml(order.reference);
  const amount  = escapeHtml(order.amount.toLocaleString('es-CO'));
  const qty     = escapeHtml(String(order.quantity));
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Nuevo pedido — Royale</title>
</head>
<body style="margin:0;padding:0;background:#0A0908;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0908;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <tr>
            <td style="padding:0 0 28px;border-bottom:1px solid rgba(201,169,97,0.2);">
              <p style="margin:0;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#C9A961;">
                ROYALE — NUEVO PEDIDO
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 0 24px;">
              <h1 style="margin:0;font-size:22px;font-weight:400;color:#F5F1E8;
                          font-family:Georgia,serif;font-style:italic;">
                Pago aprobado ✓
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 24px;background:rgba(201,169,97,0.05);
                        border-left:2px solid rgba(201,169,97,0.35);">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:5px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;
                              color:#C9A961;width:40%;">Referencia</td>
                  <td style="padding:5px 0;font-size:13px;color:#F5F1E8;text-align:right;">
                    ${ref}
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;
                              color:#C9A961;">Producto</td>
                  <td style="padding:5px 0;font-size:13px;color:#F5F1E8;text-align:right;">
                    ${product} × ${qty}
                  </td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;
                              color:#C9A961;">Total cobrado</td>
                  <td style="padding:5px 0;font-size:15px;font-weight:700;color:#C9A961;text-align:right;">
                    $${amount} COP
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 0;">
              <div style="height:1px;background:rgba(201,169,97,0.12);"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 0 8px;">
              <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#C9A961;">
                Datos del cliente
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="padding:3px 0;font-size:14px;color:#F5F1E8;">${name}</td></tr>
                <tr><td style="padding:3px 0;font-size:13px;color:rgba(245,241,232,0.6);">${email}</td></tr>
                <tr><td style="padding:3px 0;font-size:13px;color:rgba(245,241,232,0.6);">${phone}</td></tr>
                <tr>
                  <td style="padding:8px 0 3px;font-size:13px;color:rgba(245,241,232,0.8);">
                    ${address}<br>
                    ${city}, ${dept}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin:0;font-size:11px;color:rgba(245,241,232,0.25);">
                Royale Luxury Coffee — Panel de órdenes
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Envíos ────────────────────────────────────────────────────────────────
async function notifyClient(order) {
  await resend.emails.send({
    from:    process.env.ROYALE_EMAIL_FROM || 'Royale Luxury Coffee <orders@royaleluxurycoffee.com>',
    to:      order.customer.email,
    subject: `Su orden Royale Luxury Coffee está confirmada — Ref. ${order.reference}`,
    html:    clientEmailTemplate(order)
  });
  console.log(`📧 Email cliente → ${order.customer.email}`);
}

async function notifyOwner(order) {
  const ownerEmail = process.env.ROYALE_OWNER_EMAIL;
  if (!ownerEmail) return;
  await resend.emails.send({
    from:    process.env.ROYALE_EMAIL_FROM || 'Royale Luxury Coffee <orders@royaleluxurycoffee.com>',
    to:      ownerEmail,
    subject: `Nuevo pedido — ${order.customer.name} — $${order.amount.toLocaleString('es-CO')} COP`,
    html:    ownerEmailTemplate(order)
  });
  console.log(`📧 Email dueño → ${ownerEmail}`);
}

// ─── Handler ───────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  const redis = new Redis({
    url:   process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN
  });

  if (req.method !== 'POST') return res.status(405).end();

  // Verificar secret del webhook si está configurado
  const webhookSecret = process.env.BOLD_WEBHOOK_SECRET;
  if (webhookSecret) {
    const incomingSecret = req.headers['x-bold-secret'] || req.headers['x-webhook-secret'];
    if (incomingSecret !== webhookSecret) {
      console.warn('⚠️  Webhook: secret inválido');
      return res.status(401).end();
    }
  }

  try {
    const { status, reference } = req.body;

    if (!isValidReference(reference)) return res.status(200).end();
    if (status !== 'APPROVED')        return res.status(200).end();

    const order = await redis.get(reference);
    if (!order) {
      console.warn(`⚠️  Webhook: orden no encontrada — ref ${reference}`);
      return res.status(200).end();
    }

    console.log(`✅ PAGO APROBADO — ${reference} | $${order.amount.toLocaleString('es-CO')} COP`);

    const results = await Promise.allSettled([
      notifyClient(order),
      notifyOwner(order)
    ]);

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`❌ Email ${i === 0 ? 'cliente' : 'dueño'} falló:`, r.reason?.message);
      }
    });

    await redis.del(reference);
    return res.status(200).end();

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).end();
  }
};
