const express = require("express");
const cors    = require("cors");
const crypto  = require("crypto");
const { Resend } = require("resend");
require("dotenv").config();

const app    = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Middlewares ───────────────────────────────────────────────────────────
const allowedOrigins = [
  "https://leroncoffee.com",
  "http://localhost",
  "http://127.0.0.1"
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: origen no permitido"));
    }
  }
}));
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));

// ─── Validación de cliente ─────────────────────────────────────────────────
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

// ─── Órdenes pendientes ────────────────────────────────────────────────────
const pendingOrders = new Map();

// ─── Catálogo ──────────────────────────────────────────────────────────────
const products = [
  {
    id: "black-heron-340g",
    name: "The Black Heron — Garza Negra",
    priceCOP: 30000
  },
  {
    id: "immortal-heron-340g",
    name: "The Immortal Heron — Garza Inmortal",
    priceCOP: 30000
  }
];

// ─── Email al cliente ──────────────────────────────────────────────────────
function clientEmailTemplate(order) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Su orden Leron</title>
</head>
<body style="margin:0;padding:0;background:#14120F;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#14120F;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 40px;border-bottom:1px solid rgba(201,169,97,0.2);">
              <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                         font-size:10px;letter-spacing:5px;text-transform:uppercase;
                         color:#C9A961;">Leron</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:40px 0 8px;">
              <h1 style="margin:0;font-size:28px;font-weight:400;line-height:1.2;
                          color:#F3EEE4;font-style:italic;">
                Orden confirmada.
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 32px;">
              <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                         font-size:13px;color:rgba(243, 238, 228,0.5);letter-spacing:0.05em;">
                Ref. ${order.reference}
              </p>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding:0 0 32px;">
              <p style="margin:0;font-size:16px;line-height:1.8;color:rgba(243, 238, 228,0.75);">
                Estimado/a ${order.customer.name},
              </p>
              <p style="margin:16px 0 0;font-size:16px;line-height:1.8;color:rgba(243, 238, 228,0.75);">
                Su pedido <em style="color:#F3EEE4;">${order.product}</em> — ${order.quantity} × 340 g
                ha sido procesado exitosamente por un total de
                <strong style="color:#C9A961;">$${order.amount.toLocaleString('es-CO')} COP</strong>.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 0 32px;">
              <div style="height:1px;background:rgba(201,169,97,0.15);"></div>
            </td>
          </tr>

          <!-- Despacho -->
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
                          color:rgba(243, 238, 228,0.65);">
                Leron procesa su orden de inmediato. Su paquete será entregado por
                <em style="color:#F3EEE4;">Interrapidísimo</em> en la dirección registrada.
              </p>
            </td>
          </tr>

          <!-- Aviso WhatsApp -->
          <tr>
            <td style="padding:0 0 32px;">
              <p style="margin:0;font-size:15px;line-height:1.8;color:rgba(243, 238, 228,0.75);">
                Pronto recibirá un mensaje de
                <strong style="color:#F3EEE4;">WhatsApp</strong> al número
                <em style="color:#C9A961;">${order.customer.phone}</em>
                con el valor exacto del flete a cancelar al mensajero en efectivo
                al momento de la entrega.
              </p>
            </td>
          </tr>

          <!-- FCE callout -->
          <tr>
            <td style="padding:24px;background:rgba(201,169,97,0.05);
                        border-left:2px solid rgba(201,169,97,0.3);">
              <p style="margin:0 0 6px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                          font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C9A961;">
                Flete Contra Entrega
              </p>
              <p style="margin:0;font-size:14px;font-style:italic;line-height:1.8;
                          color:rgba(243, 238, 228,0.6);">
                El costo del transporte se cancela directamente al mensajero
                en efectivo al momento de la entrega.
              </p>
            </td>
          </tr>

          <tr><td style="padding:32px 0 0;"></td></tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 0 32px;">
              <div style="height:1px;background:rgba(201,169,97,0.15);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                          font-size:11px;color:rgba(243, 238, 228,0.3);line-height:1.8;">
                Garzón, Huila — Coffee as Culture<br>
                <a href="mailto:info@leroncoffee.com"
                   style="color:rgba(201,169,97,0.6);text-decoration:none;">
                  info@leroncoffee.com
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
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Nuevo pedido — Leron</title>
</head>
<body style="margin:0;padding:0;background:#14120F;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#14120F;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <tr>
            <td style="padding:0 0 28px;border-bottom:1px solid rgba(201,169,97,0.2);">
              <p style="margin:0;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#C9A961;">
                LERON — NUEVO PEDIDO
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 0 24px;">
              <h1 style="margin:0;font-size:22px;font-weight:400;color:#F3EEE4;font-family:Georgia,serif;font-style:italic;">
                Pago aprobado ✓
              </h1>
            </td>
          </tr>

          <!-- Resumen del pedido -->
          <tr>
            <td style="padding:20px 24px;background:rgba(201,169,97,0.05);border-left:2px solid rgba(201,169,97,0.35);">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:5px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A961;width:40%;">Referencia</td>
                  <td style="padding:5px 0;font-size:13px;color:#F3EEE4;text-align:right;">${order.reference}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A961;">Producto</td>
                  <td style="padding:5px 0;font-size:13px;color:#F3EEE4;text-align:right;">${order.product} × ${order.quantity}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C9A961;">Total cobrado</td>
                  <td style="padding:5px 0;font-size:15px;font-weight:700;color:#C9A961;text-align:right;">$${order.amount.toLocaleString('es-CO')} COP</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="padding:20px 0;"><div style="height:1px;background:rgba(201,169,97,0.12);"></div></td></tr>

          <!-- Datos del cliente -->
          <tr>
            <td style="padding:0 0 8px;">
              <p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#C9A961;">Datos del cliente</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr><td style="padding:3px 0;font-size:14px;color:#F3EEE4;">${order.customer.name}</td></tr>
                <tr><td style="padding:3px 0;font-size:13px;color:rgba(243, 238, 228,0.6);">${order.customer.email}</td></tr>
                <tr><td style="padding:3px 0;font-size:13px;color:rgba(243, 238, 228,0.6);">${order.customer.phone}</td></tr>
                <tr>
                  <td style="padding:8px 0 3px;font-size:13px;color:rgba(243, 238, 228,0.8);">
                    ${order.customer.address}<br>
                    ${order.customer.city}, ${order.customer.department}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td>
              <p style="margin:0;font-size:11px;color:rgba(243, 238, 228,0.25);">
                Leron — Panel de órdenes
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
    from: process.env.LERON_EMAIL_FROM || "Leron <orders@leroncoffee.com>",
    to:   order.customer.email,
    subject: `Su orden Leron está confirmada — Ref. ${order.reference}`,
    html: clientEmailTemplate(order)
  });
  console.log(`📧 Email cliente → ${order.customer.email}`);
}

async function notifyOwner(order) {
  const ownerEmail = process.env.LERON_OWNER_EMAIL;
  if (!ownerEmail) return;
  await resend.emails.send({
    from: process.env.LERON_EMAIL_FROM || "Leron <orders@leroncoffee.com>",
    to:   ownerEmail,
    subject: `Nuevo pedido — ${order.customer.name} — $${order.amount.toLocaleString('es-CO')} COP`,
    html: ownerEmailTemplate(order)
  });
  console.log(`📧 Email dueño → ${ownerEmail}`);
}

// ─── Rutas ─────────────────────────────────────────────────────────────────

app.get("/", (req, res) => res.send("🚀 Leron Engine: Online"));

app.post("/order", async (req, res) => {
  try {
    const { productId, quantity, cadence, customer } = req.body;

    const customerError = validateCustomer(customer);
    if (customerError) {
      return res.status(400).json({ success: false, error: customerError });
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ success: false, error: "Producto no encontrado" });
    }

    const cant         = Math.min(Math.max(parseInt(quantity) || 1, 1), 10);
    const discountRate = cadence === 'sub' ? 0.12 : 0;
    const unitPrice    = Math.round(product.priceCOP * (1 - discountRate));
    const totalAmount  = unitPrice * cant;
    const reference    = `LERON-${Date.now()}`;

    console.log(`\n📦 Procesando: ${product.name} x${cant} | ref: ${reference}`);

    pendingOrders.set(reference, {
      reference,
      product:  product.name,
      quantity: cant,
      amount:   totalAmount,
      customer,
      createdAt: new Date().toISOString()
    });

    const response = await fetch("https://integrations.api.bold.co/online/link/v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `x-api-key ${process.env.BOLD_API_KEY}`
      },
      body: JSON.stringify({
        amount_type: "CLOSE",
        amount: { currency: "COP", total_amount: totalAmount },
        description: `Leron: ${product.name} x${cant} — ${customer.name}`.slice(0, 100),
        reference,
        redirect_url: process.env.REDIRECT_URL || "https://leroncoffee.com/thanks.html"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Bold error:", response.status);
      pendingOrders.delete(reference);
      return res.status(502).json({ success: false, error: "Error al generar el link de pago" });
    }

    res.json({ success: true, paymentUrl: data.payload?.url || data.url });

  } catch (error) {
    console.error("Error /order:", error);
    res.status(500).json({ success: false, error: "Fallo interno" });
  }
});

// ─── Webhook Bold ──────────────────────────────────────────────────────────
app.post("/webhook/bold", async (req, res) => {
  try {
    if (process.env.BOLD_WEBHOOK_SECRET) {
      const sig      = req.headers['x-bold-signature'] || '';
      const expected = crypto
        .createHmac('sha256', process.env.BOLD_WEBHOOK_SECRET)
        .update(req.rawBody)
        .digest('hex');
      if (sig !== expected) return res.sendStatus(401);
    }

    const { status, reference } = req.body;

    if (status !== "APPROVED") {
      return res.sendStatus(200);
    }

    const order = pendingOrders.get(reference);
    if (!order) {
      console.warn(`⚠️  Webhook: orden no encontrada para ref ${reference}`);
      return res.sendStatus(200);
    }

    console.log(`\n✅ PAGO APROBADO — ${reference} | $${order.amount.toLocaleString('es-CO')} COP`);

    const results = await Promise.allSettled([
      notifyClient(order),
      notifyOwner(order)
    ]);

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`❌ Email ${i === 0 ? 'cliente' : 'dueño'} falló:`, r.reason?.message);
      }
    });

    pendingOrders.delete(reference);
    res.sendStatus(200);

  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n=========================================`);
  console.log(`✅ Leron Backend corriendo en el puerto ${PORT}`);
  console.log(`=========================================\n`);
});
