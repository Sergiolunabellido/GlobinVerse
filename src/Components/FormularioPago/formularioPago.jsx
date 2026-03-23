import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * @brief Componente de formulario de pago con Stripe.
 * @fecha 2026-03-18
 * @description Este componente renderiza el formulario de pago de Stripe y maneja
 * el proceso de confirmación del pago. Se comunica con la API de Stripe para
 * procesar el pago de forma segura.
 * @returns {JSX.Element} Formulario de pago con Stripe.
 */
export default function FormularioPago({ clientSecret }) {
  const stripe = useStripe();
  const elementos = useElements();
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [pagoCompleto, setPagoCompleto] = useState(false);
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombre, setNombre] = useState('');

  const extraerPaymentIntentId = (clientSecret) => {
    if (typeof clientSecret !== 'string') return null;
    const idx = clientSecret.indexOf('_secret_');
    if (idx <= 0) return null;
    const id = clientSecret.slice(0, idx);
    return id.startsWith('pi_') ? id : null;
  };

  /**
   * @brief Maneja el envío del formulario de pago.
   * @fecha 2026-03-18
   * @param {Event} evento - Evento de submit del formulario.
   * @description Valida que Stripe esté cargado, confirma el pago con Stripe
   * y redirige a la página de éxito si el pago es exitoso.
   * @returns {void} No devuelve nada, redirige en caso de éxito.
   */
  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    if (!stripe || !elementos) {
      setMensajeError('El sistema de pago no está listo. Por favor, espera un momento.');
      return;
    }

    if (!pagoCompleto) {
      setMensajeError('Completa primero los datos de la tarjeta para continuar.');
      return;
    }

   
    setProcesandoPago(true);
    setMensajeError('');

    try {
      // Guardamos los datos en el PaymentIntent para que queden asociados en Stripe (recibo + metadata).
      // El id se extrae del clientSecret: "pi_..._secret_...".
      const paymentIntentId = extraerPaymentIntentId(clientSecret);
      if (paymentIntentId) {
        await fetch('http://localhost:5000/api/pagos/actualizarIntentoPago', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId,
          }),
        }).catch(() => null);
      }

      const { error } = await stripe.confirmPayment({
        elements: elementos,
        confirmParams: {
          return_url: `${window.location.origin}/pago-exitoso`,
          payment_method_data: {
            billing_details: {
              
            },
          },
        },
      });

      if (error) {
        setMensajeError(error.message);
        toast.error(error.message);
      }
    } catch (error) {
      setMensajeError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      toast.error('Error al procesar el pago');
    } finally {
      setProcesandoPago(false);
    }
  };

  return (
    <form onSubmit={manejarEnvio} className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="bg-[#1a3a25] p-6 rounded-xl border border-green-800">
        <PaymentElement onChange={(e) => setPagoCompleto(Boolean(e?.complete))} />
      </div>
      {mensajeError && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">{mensajeError}</div>
      )}

      <button
        type="submit"
        disabled={!stripe || procesandoPago}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black text-lg font-bold py-4 px-8 rounded-xl transition duration-300 ease-in-out w-full"
      >
        {procesandoPago ? 'Procesando...' : 'Pagar Ahora'}
      </button>
    </form>
  );
}
