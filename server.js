const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
const allowedOrigins = [
  "https://royaleluxurycoffee.com",
  "http://localhost",
  "http://127.0.0.1"
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error("CORS: origen no permitido"));
    }
  }
}));
app.use(express.json());

// ─── Shipping (Interrapidísimo 2025-2026) ─────────────────────────────────
const SHIPPING_RATES = {
  LOCAL: 8800,
  REGIONAL: 11000,
  NACIONAL: 18000,
  DIFICIL_ACCESO: 29000
};

const SHIPPING_MARGINS = {
  LOCAL: 3000,
  REGIONAL: 4000,
  NACIONAL: 6000,
  DIFICIL_ACCESO: 0   // zonas especiales se coordinan manualmente
};

const DEPT_ZONE = {
  BOGOTADC: 'LOCAL',
  CUNDINAMARCA: 'REGIONAL', BOYACA: 'REGIONAL',
  TOLIMA: 'REGIONAL', META: 'REGIONAL',
  CALDAS: 'REGIONAL', RISARALDA: 'REGIONAL',
  QUINDIO: 'REGIONAL', ANTIOQUIA: 'REGIONAL',
  VALLE: 'REGIONAL', SANTANDER: 'REGIONAL',
  HUILA: 'REGIONAL', ATLANTICO: 'NACIONAL',
  BOLIVAR: 'NACIONAL', MAGDALENA: 'NACIONAL',
  CESAR: 'NACIONAL', LAGUAJIRA: 'NACIONAL',
  CORDOBA: 'NACIONAL', SUCRE: 'NACIONAL',
  CAUCA: 'NACIONAL', NARINO: 'NACIONAL',
  NORTESANTANDER: 'NACIONAL', ARAUCA: 'NACIONAL',
  CASANARE: 'NACIONAL', AMAZONAS: 'DIFICIL_ACCESO',
  CAQUETA: 'DIFICIL_ACCESO', CHOCO: 'DIFICIL_ACCESO',
  GUAINIA: 'DIFICIL_ACCESO', GUAVIARE: 'DIFICIL_ACCESO',
  PUTUMAYO: 'DIFICIL_ACCESO', SANANDRES: 'DIFICIL_ACCESO',
  VAUPES: 'DIFICIL_ACCESO', VICHADA: 'DIFICIL_ACCESO'
};

function calcShipping(dept, productValue) {
  const zone = DEPT_ZONE[dept] || 'NACIONAL';
  const base = SHIPPING_RATES[zone];
  const iva = Math.round(base * 0.19);
  const declared = Math.max(productValue, 45000); // declaración mínima para ≤2 kg
  const sobreflete = Math.round(declared * 0.02);
  const margin = SHIPPING_MARGINS[zone];
  return base + iva + sobreflete + margin;
}

// ─── Catálogo Royale ───────────────────────────────────────────────────────
const products = [
  {
    id: "black-heron-340g",
    name: "The Black Heron — Garza Negra",
    priceCOP: 30000 // ⚠️ Sin puntos, el precio real en pesos
  }
];

// ─── Rutas ─────────────────────────────────────────────────────────────────

app.get("/", (req, res) => res.send("🚀 Royale Engine: Online"));

app.post("/order", async (req, res) => {
  try {
    // Recibimos también el objeto 'customer' que mandó el HTML
    const { productId, quantity, cadence, customer } = req.body;
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ success: false, error: "Producto no encontrado" });
    }

    const zone = DEPT_ZONE[customer?.department] || 'NACIONAL';
    if (zone === 'DIFICIL_ACCESO') {
      return res.status(400).json({ success: false, error: 'ZONA_DIFICIL_ACCESO' });
    }

    const cant = parseInt(quantity) || 1;
    const discountRate = cadence === 'sub' ? 0.12 : 0;
    const unitPrice = Math.round(product.priceCOP * (1 - discountRate));
    const productTotal = unitPrice * cant;
    const shippingCOP = calcShipping(customer?.department, product.priceCOP);
    const totalAmount = Math.round(productTotal + shippingCOP);

    const notaEnvio = `Cliente: ${customer.name} | Envío a: ${customer.address}, ${customer.city} | Envío: $${shippingCOP.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

    console.log(`\n📦 Procesando: ${product.name} x${cant}`);
    console.log(`🚚 ${notaEnvio}`);

    const response = await fetch("https://integrations.api.bold.co/online/link/v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `x-api-key ${process.env.BOLD_API_KEY}`
      },
      body: JSON.stringify({
        amount_type: "CLOSE",
        amount: {
          currency: "COP",
          total_amount: totalAmount
        },
        // 👇 AQUÍ inyectamos los datos del cliente en la factura de Bold
        description: `Royale: ${product.name}. ${notaEnvio}`,
        reference: `ROYALE-${Date.now()}`,
        redirect_url: process.env.REDIRECT_URL || "https://royaleluxurycoffee.com/thanks"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Bold error:', JSON.stringify(data));
      return res.status(response.status).json({ success: false, error: data });
    }

    res.json({
      success: true,
      paymentUrl: data.payload?.url || data.url
    });

  } catch (error) {
    res.status(500).json({ success: false, error: "Fallo interno" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n=========================================`);
  console.log(`✅ Royale Backend corriendo en el puerto ${PORT}`);
  console.log(`=========================================\n`);
});