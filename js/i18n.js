(function (root) {
    var T = {
        es: {
            /* ── index.html ─────────────────────────── */
            'editorial-h2':   'Huila no es origen.<br>Es estándar.',
            'editorial-p':    'En las montañas del Huila, el café no es industria apresurada. Es práctica lenta, consciente y obsesiva. Cada microlote es una decisión.',
            'showcase-left':  'En las altas mesetas del Huila, el café no se cosecha.<br><strong>Se selecciona.</strong> Cada cereza, en su momento exacto de madurez.',
            'showcase-right': 'Proceso Washed. Tueste Medium Dark. Notas de Chocolate Oscuro, Caramelo &amp; Almendra Tostada.',
            'origen-h2':      'Origen',
            'origen-p':       'Garzón, Huila es una región donde el café se cultiva con altitud, tiempo y criterio. Cada microlote responde a decisiones humanas, no industriales.',
            'stat-msnm':      'msnm máximo',
            'stat-cosecha':   'cosecha manual',

            /* ── Comprar.html — producto ────────────── */
            'product-copy':    'Recolectado cereza a cereza a 1.800 m, lavado con agua de manantial, reposado veintiún días en cedro antes del tueste. Un tostado medio-oscuro que se abre en chocolate y termina en cedro.',
            'format-label':    'Formato',
            'format-hint':     'Elige uno',
            'grind-label':     'Molido',
            'cadence-label':   'Cadencia',
            'cadence-hint':    'Pausa cuando quieras',
            'cadence-once':    'Una vez',
            'cadence-shipment':'Envío único',
            'qty-label':       'Cantidad',
            'shop-btn':        'Comprar ahora',

            /* ── Comprar.html — checkout ────────────── */
            'checkout-step':   'Paso 02 / Logística',
            'checkout-title':  'Datos de envío',
            'label-name':      'Nombre completo',
            'label-dept':      'Departamento',
            'label-city':      'Ciudad',
            'label-address':   'Dirección',
            'ph-name':         'Tu nombre completo',
            'ph-address':      'Calle, apto, edificio...',
            'opt-dept':        'Selecciona departamento',
            'opt-city':        'Selecciona ciudad',
            'shipping-label':  'Envío (Interrapidísimo)',
            'back-btn':        '← Volver al producto',
            'zona-aviso':      'Zona de difícil acceso — te contactamos en menos de 24 h para coordinar el envío.',
            'alert-fill':      'Por favor completa todos los datos de envío.',
            'alert-error':     'Error al crear el link de pago. Intenta de nuevo.',
            'alert-conn':      'Error de conexión. Revisa tu internet e intenta de nuevo.',

            /* ── Comprar.html — origen quote ────────── */
            'origin-quote':    'Del bosque nublado<br>hasta<br>tu taza<span class="dot">.</span>',

            /* ── Comprar.html — dossier ─────────────── */
            'dossier-title':   'El dossier, <em class="gold-grad">al detalle.</em>',
            'dossier-helper':  'Cuatro capítulos, sin acordeones que abrir.',
            'd01-h3':          'Un café numerado, no de marca.',
            'd01-p':           'Black Heron es el microlote inaugural de la serie Garza Negra — un Arabica single-estate de Garzón, Huila. Cada bolsa lleva su número de lote y la fecha en que salió del tambor.',
            'd02-h3':          'Tambores pequeños, calor lento.',
            'd02-p':           'Tostado en lotes artesanales de 12 kg en nuestro atelier en Bogotá. Grano entero por defecto; molido a pedido la mañana que sale tu orden, nunca antes.',
            'd03-h3':          'Garzón, donde respira el bosque nublado.',
            'd03-p':           'Recolectado a mano entre octubre y febrero por la familia Vargas — agricultores de tercera generación que trabajan cuatro hectáreas sobre el Magdalena.',
            'd04-h3':          'Chocolate que se convierte en cedro.',

            /* ── Comprar.html — provenance ──────────── */
            'prov-title':      'Cada bolsa lleva<br><em class="gold-grad">sus papeles.</em>',
            'prov-cert':       'Descargar Certificado (PDF)',
        },

        en: {
            /* ── index.html ─────────────────────────── */
            'editorial-h2':   'Huila is not an origin.<br>It\'s a standard.',
            'editorial-p':    'In the mountains of Huila, coffee is not rushed industry. It is slow, deliberate, obsessive practice. Every microlot is a decision.',
            'showcase-left':  'In the high plateaus of Huila, coffee is not harvested.<br><strong>It\'s selected.</strong> Each cherry, at its exact moment of ripeness.',
            'showcase-right': 'Washed Process. Medium Dark Roast. Notes of Dark Chocolate, Caramel &amp; Roasted Almond.',
            'origen-h2':      'Origin',
            'origen-p':       'Garzón, Huila is a region where coffee is grown with altitude, time, and judgment. Every microlot reflects human decisions, not industrial ones.',
            'stat-msnm':      'max masl',
            'stat-cosecha':   'hand-harvested',

            /* ── Comprar.html — producto ────────────── */
            'product-copy':    'Picked one cherry at a time at 1.800 m, washed under spring water, rested twenty-one days in cedar before roast. A medium-dark that opens into chocolate and finishes on cedar.',
            'format-label':    'Format',
            'format-hint':     'Choose one',
            'grind-label':     'Grind',
            'cadence-label':   'Cadence',
            'cadence-hint':    'Pause anytime',
            'cadence-once':    'Once',
            'cadence-shipment':'Single Shipment',
            'qty-label':       'Quantity',
            'shop-btn':        'Shop Origin Now',

            /* ── Comprar.html — checkout ────────────── */
            'checkout-step':   'Step 02 / Logistics',
            'checkout-title':  'Shipping Details',
            'label-name':      'Full Name',
            'label-dept':      'Department',
            'label-city':      'City',
            'label-address':   'Address',
            'ph-name':         'Your full name',
            'ph-address':      'Street, apt, building...',
            'opt-dept':        'Select department',
            'opt-city':        'Select city',
            'shipping-label':  'Shipping (Interrapidísimo)',
            'back-btn':        '← Back to product',
            'zona-aviso':      'Remote area — we\'ll contact you within 24 h to arrange shipping.',
            'alert-fill':      'Please fill in all shipping details.',
            'alert-error':     'Error creating payment link. Please try again.',
            'alert-conn':      'Connection error. Please check your internet and try again.',

            /* ── Comprar.html — origen quote ────────── */
            'origin-quote':    'From the cloud<br>forest floor to<br>your cup<span class="dot">.</span>',

            /* ── Comprar.html — dossier ─────────────── */
            'dossier-title':   'The dossier, <em class="gold-grad">unfolded.</em>',
            'dossier-helper':  'Four chapters, no accordions to click through.',
            'd01-h3':          'A coffee numbered, not branded.',
            'd01-p':           'Black Heron is the inaugural microlot in the Garza Negra series — a single-estate Arabica from Garzón, Huila. Each bag carries its lot number and the date it left the drum.',
            'd02-h3':          'Small drums, slow heat.',
            'd02-p':           'Roasted in 12 kg artisanal batches at our Bogotá atelier. Whole bean by default; ground on demand the morning your order ships, never before.',
            'd03-h3':          'Garzón, where the cloud forest breathes.',
            'd03-p':           'Hand-picked between October and February by the Vargas family — third-generation farmers working four hectares above the Magdalena.',
            'd04-h3':          'Chocolate that cools into cedar.',

            /* ── Comprar.html — provenance ──────────── */
            'prov-title':      'Every bag carries<br><em class="gold-grad">its papers.</em>',
            'prov-cert':       'Download Certificate (PDF)',
        }
    };

    var lang = localStorage.getItem('rlc-lang') || 'es';

    function t(key) {
        return (T[lang] && T[lang][key] !== undefined) ? T[lang][key] : (T['en'][key] || key);
    }

    function apply(l) {
        lang = l;
        localStorage.setItem('rlc-lang', l);
        document.documentElement.lang = l;

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.dataset.i18n;
            var text = T[l][key];
            if (text === undefined) return;
            if (text.indexOf('<') !== -1) {
                el.innerHTML = text;
            } else {
                el.textContent = text;
            }
        });

        document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
            var text = T[l][el.dataset.i18nPh];
            if (text !== undefined) el.placeholder = text;
        });

        document.querySelectorAll('[data-i18n-opt]').forEach(function (el) {
            var text = T[l][el.dataset.i18nOpt];
            if (text !== undefined) el.textContent = text;
        });

        document.querySelectorAll('[data-lang]').forEach(function (btn) {
            btn.classList.toggle('lang-active', btn.dataset.lang === l);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        apply(lang);
        document.querySelectorAll('[data-lang]').forEach(function (btn) {
            btn.addEventListener('click', function () { apply(btn.dataset.lang); });
        });
    });

    root.I18n = { apply: apply, t: t };
}(window));
