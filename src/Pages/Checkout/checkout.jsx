/**
 * @fileoverview Página de Checkout para procesar pagos con Stripe.
 * @fecha 2026-03-18
 */

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import FormularioPago from '../../Components/FormularioPago/formularioPago';
import Header from '../../Components/Header/header';
import toast from 'react-hot-toast';

/**
 * @brief Instancia de Stripe cargada con la clave pública.
 * @description Esta instancia se crea una sola vez y se reutiliza en toda la aplicación.
 * La clave pública es segura para exponer en el frontend (empieza con pk_test_ o pk_live_).
 */
const instanciaStripe = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

/**
 * @brief Página de Checkout que muestra el formulario de pago de Stripe.
 * @fecha 2026-03-18
 * @description Esta página se encarga de:
 * 1. Recibir el monto total desde el carrito
 * 2. Crear un intento de pago en el backend
 * 3. Mostrar el formulario de pago de Stripe
 * 4. Manejar el resultado del pago
 * @returns {JSX.Element} Página de checkout con formulario de pago.
 */
export default function Checkout() {
 
    const ubicacion = useLocation();
    const navegar = useNavigate();
    const [secretoCliente, setSecretoCliente] = useState('');
    const [cargando, setCargando] = useState(true);

    /**
     * @brief Extraemos el monto total del estado de navegación.
     * @description El carrito pasa este valor cuando redirige a esta página.
     * Si no hay monto, redirigimos al carrito.
     */
    const montoTotal = ubicacion.state?.montoTotal;

    /**
     * @brief Efecto que se ejecuta al montar el componente.
     * @fecha 2026-03-18
     * @description Crea el intento de pago llamando al backend.
     * Si no hay monto total, redirige al carrito.
     * @returns {void} No devuelve nada.
     */
    useEffect(() => {
        /**
         * @brief Función asíncrona para crear el intento de pago.
         * @description Envía el monto al backend y recibe el secreto del cliente.
         * @returns {Promise<void>} No devuelve datos, actualiza el estado.
         */
        const crearIntentoPago = async () => {
          
            if (!montoTotal || montoTotal <= 0) {
                toast.error('No hay items en el carrito');
                navegar('/carrito');
                return;
            }

            try {
                const respuesta = await fetch('http://localhost:5000/api/pagos/intentoPago', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        monto: montoTotal, 
                        moneda: 'eur',
                    }),
                });

                if (!respuesta.ok) {
                    throw new Error('Error al crear el intento de pago');
                }

                const datos = await respuesta.json();

                
                setSecretoCliente(datos.secretoCliente);
            } catch (error) {
                console.error('Error al crear intento de pago:', error);
                toast.error('No se pudo iniciar el proceso de pago');
                navegar('/carrito');
            } finally {
                // Desactivamos el estado de carga
                setCargando(false);
            }
        };

        // Ejecutamos la función de creación del intento de pago
        crearIntentoPago();
    }, [montoTotal, navegar]);


    // Personalizamos los colores para que coincidan con el tema de la aplicación
    const opcionesApariencia = {
        clientSecret: secretoCliente,
        appearance: {
            theme: 'night', // Tema oscuro que coincide con nuestra app
            variables: {
                colorPrimary: '#22c55e',      // Verde principal
                colorBackground: '#1a3a25',   // Fondo verde oscuro
                colorText: '#ffffff',         // Texto blanco
                colorDanger: '#ef4444',       // Rojo para errores
                fontFamily: 'system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
            },
        },
    };

    return (
        <div className="flex flex-col items-center w-screen min-h-screen bg-[#102216]">
            <Header />

            <div className="flex flex-col items-center justify-center flex-grow w-full max-w-4xl px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-white text-3xl sm:text-4xl font-bold mb-4">
                        Finalizar Compra
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Introduce los datos de tu tarjeta para completar el pago
                    </p>
                </div>

                {/*
                    Mostramos un mensaje de carga mientras se crea el intento de pago.
                    Esto suele tardar menos de un segundo, pero es importante mostrar
                    feedback al usuario.
                */}
                {cargando ? (
                    <div className="text-green-400 text-xl">
                        Preparando el pago seguro...
                    </div>
                ) : (
                    /*
                        Elements es el contenedor de Stripe que proporciona el contexto
                        para los componentes de pago. Necesita el clientSecret para
                        vincular el formulario con el intento de pago creado en el backend.
                    */
                    secretoCliente && (
                        <Elements stripe={instanciaStripe} options={opcionesApariencia}>
                            <FormularioPago />
                        </Elements>
                    )
                )}

                {/*
                    Mostramos el resumen del pedido con el monto total.
                    Esto ayuda al usuario a confirmar que está pagando la cantidad correcta.
                */}
                {!cargando && montoTotal > 0 && (
                    <div className="mt-8 p-6 bg-[#1a3a25] rounded-xl border border-green-800 w-full max-w-md">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-lg">Total a pagar:</span>
                            <span className="text-white text-2xl font-bold">
                                ${montoTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
