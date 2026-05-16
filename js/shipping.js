(function (root) {
    'use strict';

    // Interrapidísimo 2025-2026 — Mensajería Expresa hasta 5 kg
    var RATES = {
        LOCAL:           8800,
        REGIONAL:       11000,
        NACIONAL:       18000,
        DIFICIL_ACCESO: 29000
    };

    var MARGINS = {
        LOCAL:          3000,
        REGIONAL:       4000,
        NACIONAL:       6000,
        DIFICIL_ACCESO: 0
    };

    // Shipments from Bogotá. Departments not listed default to NACIONAL.
    var DEPT_ZONE = {
        BOGOTADC:       'LOCAL',
        CUNDINAMARCA:   'REGIONAL',
        BOYACA:         'REGIONAL',
        TOLIMA:         'REGIONAL',
        META:           'REGIONAL',
        CALDAS:         'REGIONAL',
        RISARALDA:      'REGIONAL',
        QUINDIO:        'REGIONAL',
        ANTIOQUIA:      'REGIONAL',
        VALLE:          'REGIONAL',
        SANTANDER:      'REGIONAL',
        HUILA:          'REGIONAL',
        ATLANTICO:      'NACIONAL',
        BOLIVAR:        'NACIONAL',
        MAGDALENA:      'NACIONAL',
        CESAR:          'NACIONAL',
        LAGUAJIRA:      'NACIONAL',
        CORDOBA:        'NACIONAL',
        SUCRE:          'NACIONAL',
        CAUCA:          'NACIONAL',
        NARINO:         'NACIONAL',
        NORTESANTANDER: 'NACIONAL',
        ARAUCA:         'NACIONAL',
        CASANARE:       'NACIONAL',
        AMAZONAS:       'DIFICIL_ACCESO',
        CAQUETA:        'DIFICIL_ACCESO',
        CHOCO:          'DIFICIL_ACCESO',
        GUAINIA:        'DIFICIL_ACCESO',
        GUAVIARE:       'DIFICIL_ACCESO',
        PUTUMAYO:       'DIFICIL_ACCESO',
        SANANDRES:      'DIFICIL_ACCESO',
        VAUPES:         'DIFICIL_ACCESO',
        VICHADA:        'DIFICIL_ACCESO'
    };

    // Minimum declared value for sobreflete (Interrapidísimo policy — ≤2 kg)
    var MIN_DECLARED = 45000;

    /**
     * @param {string} dept  - Department key (e.g. 'BOGOTADC', 'ANTIOQUIA')
     * @param {number} productValue - Product value in COP (before shipping)
     * @returns {{ zone, base, iva, sobreflete, margin, total } | null}
     */
    function calculate(dept, productValue) {
        if (!dept) return null;

        var zone = DEPT_ZONE[dept] || 'NACIONAL';

        if (zone === 'DIFICIL_ACCESO') {
            return { zone: zone, contact: true };
        }

        var base       = RATES[zone];
        var iva        = Math.round(base * 0.19);
        var declared   = Math.max(productValue, MIN_DECLARED);
        var sobreflete = Math.round(declared * 0.02);
        var margin     = MARGINS[zone];
        var total      = base + iva + sobreflete + margin;

        return { zone: zone, base: base, iva: iva, sobreflete: sobreflete, margin: margin, total: total };
    }

    root.Shipping = { calculate: calculate, RATES: RATES, DEPT_ZONE: DEPT_ZONE };

}(window));
