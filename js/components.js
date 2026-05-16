/* =============================================
   ROYALE LUXURY COFFEE — COMPONENT BEHAVIOUR
   ============================================= */

(function () {
    'use strict';

    /* helpers */
    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
    function emit(el, name, detail) {
        el.dispatchEvent(new CustomEvent(name, { detail: detail, bubbles: true }));
    }

    /* shared radio-group controller */
    function radioGroup(root, opts) {
        var buttons = $$('[role="radio"]', root);
        var activeClass = opts.activeClass || 'is-active';

        function setActive(btn) {
            buttons.forEach(function (b) {
                var on = b === btn;
                b.setAttribute('aria-checked', on ? 'true' : 'false');
                b.classList.toggle(activeClass, on);
            });
            if (opts.onChange) opts.onChange(btn);
        }

        buttons.forEach(function (btn, i) {
            btn.addEventListener('click', function () { setActive(btn); });
            btn.addEventListener('keydown', function (e) {
                var k = e.key;
                var next;
                if (k === 'ArrowLeft' || k === 'ArrowUp') {
                    e.preventDefault();
                    next = buttons[(i - 1 + buttons.length) % buttons.length];
                } else if (k === 'ArrowRight' || k === 'ArrowDown') {
                    e.preventDefault();
                    next = buttons[(i + 1) % buttons.length];
                } else if (k === 'Home') {
                    e.preventDefault();
                    next = buttons[0];
                } else if (k === 'End') {
                    e.preventDefault();
                    next = buttons[buttons.length - 1];
                }
                if (next) { setActive(next); next.focus(); }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {

        /* FormatPicker */
        $$('[data-component="format-picker"]').forEach(function (el) {
            radioGroup(el, {
                onChange: function (btn) {
                    emit(el, 'format:change', { id: btn.dataset.id, price: btn.dataset.price });
                }
            });
        });

        /* CadencePicker */
        $$('[data-component="cadence-picker"]').forEach(function (el) {
            radioGroup(el, {
                onChange: function (btn) {
                    emit(el, 'cadence:change', { id: btn.dataset.id });
                }
            });
        });

        /* GrindDial */
        $$('[data-component="grind-dial"]').forEach(function (el) {
            var ticksHost = $('.r-dial__ticks', el);
            var labels    = $$('.r-dial__labels [role="radio"]', el);
            var status    = $('.r-dial__status', el);
            var caret     = $('.r-dial__caret', el);
            var stops     = labels.length;

            function stopPct(i) { return (i / (stops - 1)) * 100; }

            /* major ticks at each stop */
            for (var i = 0; i < stops; i++) {
                var t = document.createElement('span');
                t.className = 'r-dial__tick r-dial__tick--major';
                t.style.left = stopPct(i) + '%';
                ticksHost.appendChild(t);
            }
            /* 8 minor ticks between each major pair */
            for (var i = 0; i < stops - 1; i++) {
                for (var j = 1; j <= 8; j++) {
                    var pct = stopPct(i) + (j / 9) * (100 / (stops - 1));
                    var t = document.createElement('span');
                    t.className = 'r-dial__tick r-dial__tick--minor';
                    t.style.left = pct + '%';
                    ticksHost.appendChild(t);
                }
            }

            function moveCaret(idx) { caret.style.left = stopPct(idx) + '%'; }

            var initId = el.dataset.value;
            var initIdx = labels.findIndex(function (b) { return b.dataset.id === initId; });
            moveCaret(initIdx < 0 ? 0 : initIdx);

            radioGroup(el, {
                activeClass: '__none__',          /* labels have no is-active class */
                onChange: function (btn) {
                    var idx = labels.indexOf(btn);
                    el.dataset.value = btn.dataset.id;
                    moveCaret(idx);
                    var name = btn.textContent.trim();
                    status.innerHTML = btn.dataset.id === 'whole'
                        ? '<em>' + name + '</em> — recommended'
                        : '<em>' + name + '</em>';
                    emit(el, 'grind:change', { id: btn.dataset.id, label: name });
                }
            });
        });

    });
}());
