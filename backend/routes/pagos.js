const express = require('express');
const router = express.Router();

let stripeCache = null;
function getStripe() {
  if (stripeCache) return stripeCache;
  if (!process.env.STRIPE_SECRET_KEY) return null;
  stripeCache = require('stripe')(process.env.STRIPE_SECRET_KEY);
  return stripeCache;
}

/**
 * @brief Ruta para crear un intento de pago en Stripe.
 * @fecha 2026-03-18
 * @param {Object} req - Objeto de solicitud HTTP con el monto y moneda.
 * @param {Object} res - Objeto de respuesta HTTP con el secreto del cliente.
 * @returns {void} No devuelve nada directamente, envÃ­a respuesta JSON.
 */
router.post('/intentoPago', async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe no estÃ¡ configurado (falta STRIPE_SECRET_KEY)' });
    }

    const { monto, moneda = 'eur' } = req.body;
    const montoEnCentimos = Math.round(Number(monto) * 100);

    if (!Number.isFinite(montoEnCentimos) || montoEnCentimos <= 0) {
      return res.status(400).json({ error: 'Monto invÃ¡lido' });
    }

    const intentoPago = await stripe.paymentIntents.create({
      amount: montoEnCentimos,
      currency: moneda,
      automatic_payment_methods: { enabled: true },
    });

    res.json({ secretoCliente: intentoPago.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @brief Actualiza un PaymentIntent con datos extra del comprador.
 * @fecha 2026-03-20
 * @description Asocia correo (receipt_email) y metadata (teléfono/nombre) al PaymentIntent.
 */
router.post('/actualizarIntentoPago', async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ ok: false, error: 'Stripe no estÃ¡ configurado (falta STRIPE_SECRET_KEY)' });
    }

    const { paymentIntentId, correo, telefono, nombre } = req.body || {};

    if (typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
      return res.status(400).json({ ok: false, error: 'paymentIntentId invÃ¡lido' });
    }

    const correoLimpio = typeof correo === 'string' ? correo.trim() : '';
    if (correoLimpio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      return res.status(400).json({ ok: false, error: 'Correo invÃ¡lido' });
    }

    const metadata = {};
    if (typeof telefono === 'string' && telefono.trim()) metadata.telefono = telefono.trim();
    if (typeof nombre === 'string' && nombre.trim()) metadata.nombre = nombre.trim();

    await stripe.paymentIntents.update(paymentIntentId, {
      receipt_email: correoLimpio || undefined,
      metadata,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
