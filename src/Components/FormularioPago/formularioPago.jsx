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
export default function FormularioPago() {

    const stripe = useStripe();
    const elementos = useElements();
    const [procesandoPago, setProcesandoPago] = useState(false);
    const [mensajeError, setMensajeError] = useState('');

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

        // Verificamos que Stripe y los elementos estén cargados
        // Esto puede fallar si la conexión con Stripe es lenta o hay problemas de red
        if (!stripe || !elementos) {
            setMensajeError('El sistema de pago no está listo. Por favor, espera un momento.');
            return;
        }

        // Activamos el estado de procesamiento para deshabilitar el botón
        // y evitar que el usuario haga clic múltiples veces
        setProcesandoPago(true);
        setMensajeError('');

        try {
            // Confirmamos el pago con Stripe
            // Stripe valida los datos de la tarjeta y procesa el pago
            const { error } = await stripe.confirmPayment({
                elements: elementos,
                confirmParams: {
                    return_url: `${window.location.origin}/pago-exitoso`,
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
                <PaymentElement />
            </div>

            {/* Mostramos mensajes de error si existen */}
            {mensajeError && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">
                    {mensajeError}
                </div>
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
