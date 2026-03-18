const express = require('express')
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

/**
 * @brief Ruta para crear un intento de pago en Stripe.
 * @fecha 2026-03-18
 * @param {Object} req - Objeto de solicitud HTTP con el monto y moneda.
 * @param {Object} res - Objeto de respuesta HTTP con el secreto del cliente.
 * @returns {void} No devuelve nada directamente, envía respuesta JSON.
 */
router.post('/intentoPago', async (req, res) =>{
    try{
        // Extraemos el monto y la moneda del cuerpo de la petición
        // El monto viene en euros (ej: 50.00) y Stripe necesita céntimos (ej: 5000)
        const {monto, moneda = 'eur'} = req.body;
        const montoEnCentimos = Math.round(Number(monto) * 100);

        if (!Number.isFinite(montoEnCentimos) || montoEnCentimos <= 0) {
            return res.status(400).json({ error: 'Monto inválido' });
        }

        // Creamos el intento de pago en Stripe
        // Stripe trabaja en base a la unidad más pequeña de la moneda (céntimos para EUR)
        const intentoPago = await stripe.paymentIntents.create({
            amount: montoEnCentimos,
            currency: moneda,
            automatic_payment_methods: {enabled: true}
        });

        // Enviamos el client_secret al frontend
        // Este secreto es necesario para confirmar el pago desde el lado del cliente
        res.json({secretoCliente: intentoPago.client_secret});
    }catch(error){
        // Si ocurre algún error (ej: clave inválida, monto incorrecto), lo devolvemos
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;
