/**
 * @fileoverview Página de confirmación de pago exitoso.
 * @fecha 2026-03-18
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../Components/Header/header';
import toast from 'react-hot-toast';
import { renovarToken } from '../../utils/utils';

/**
 * @brief Página que muestra la confirmación de pago exitoso.
 * @fecha 2026-03-18
 * @description Esta página se muestra después de que Stripe redirige al usuario
 * desde el formulario de pago. Verifica el estado del pago y muestra
 * un mensaje de confirmación al usuario.
 * @returns {JSX.Element} Página de confirmación de pago.
 */
export default function PagoExitoso() {
   
    const [parametrosBusqueda] = useSearchParams();
    const navegar = useNavigate();
    const [pagoExitoso, setPagoExitoso] = useState(false);
    const [verificando, setVerificando] = useState(true);
    const registroIniciadoRef = useRef(false);

    const peticionProtegida = async (url, cuerpo) => {
        const hacerPeticion = () =>
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                credentials: 'include',
                body: cuerpo ? JSON.stringify(cuerpo) : undefined,
            });

        let respuesta = await hacerPeticion();

        if (respuesta.status === 401) {
            const tokenRenovado = await renovarToken();
            if (!tokenRenovado) {
                const error = new Error('UNAUTHORIZED');
                error.status = 401;
                throw error;
            }
            respuesta = await hacerPeticion();
        }

        return respuesta;
    };

    const registrarLibrosComprados = async (paymentIntentId) => {
        const claveRegistro = paymentIntentId ? `compra_registrada_${paymentIntentId}` : null;

        if (claveRegistro && sessionStorage.getItem(claveRegistro)) return;
        if (claveRegistro) sessionStorage.setItem(claveRegistro, 'in_progress');

        try {
            const checkoutLibrosRaw = sessionStorage.getItem('checkout_libros');
            const checkoutLibros = checkoutLibrosRaw ? JSON.parse(checkoutLibrosRaw) : null;

            if (Array.isArray(checkoutLibros) && checkoutLibros.length > 0) {
                for (const idLibro of checkoutLibros) {
                    if (!idLibro) continue;
                    const respuestaGuardar = await peticionProtegida('http://localhost:5000/guardarLibroCarrito', {
                        id_libro: idLibro,
                    });
                    const datosGuardar = await respuestaGuardar.json().catch(() => null);

                    if (!respuestaGuardar.ok || datosGuardar?.ok === false) {
                        throw new Error(datosGuardar?.mensaje || 'Error al registrar la compra');
                    }
                }
                sessionStorage.removeItem('checkout_libros');
                return;
            }

            const respuestaRegistrar = await peticionProtegida('http://localhost:5000/registrarCompraCarrito');
            const datosRegistrar = await respuestaRegistrar.json().catch(() => null);

            if (!respuestaRegistrar.ok || datosRegistrar?.ok === false) {
                throw new Error(datosRegistrar?.mensaje || 'Error al registrar la compra');
            }
        } catch (error) {
            if (claveRegistro) sessionStorage.removeItem(claveRegistro);
            throw error;
        } finally {
            if (claveRegistro && sessionStorage.getItem(claveRegistro) === 'in_progress') {
                sessionStorage.setItem(claveRegistro, '1');
            }
        }
    };

    /**
     * @brief Efecto que verifica el estado del pago al cargar la página.
     * @fecha 2026-03-18
     * @description Stripe redirige a esta página con parámetros que indican
     * si el pago fue exitoso o no.
     * @returns {void} No devuelve nada.
     */
    useEffect(() => {
        /**
         * @brief Verifica el estado del pago basado en los parámetros de la URL.
         * @description Stripe añade el parámetro 'redirect_status' que puede ser:
         * - 'succeeded': El pago se completó exitosamente
         * - 'processing': El pago está siendo procesado
         * - 'requires_payment_method': El pago falló, se requiere otro método
         */
        const verificarEstadoPago = async () => {
            const estadoRedireccion = parametrosBusqueda.get('redirect_status');
            const idIntentoPago = parametrosBusqueda.get('payment_intent');

            console.log('Estado del pago:', estadoRedireccion);
            console.log('ID del intento de pago:', idIntentoPago);

            // Verificamos el estado del pago
            if (estadoRedireccion === 'succeeded') {
                setPagoExitoso(true);
                toast.success('¡Pago completado exitosamente!');

                if (!registroIniciadoRef.current) {
                    registroIniciadoRef.current = true;
                    try {
                        await registrarLibrosComprados(idIntentoPago);
                    } catch (error) {
                        if (error?.status === 401) {
                            localStorage.removeItem('token');
                            toast.error('Tienes que iniciar sesion primero para realizar una compra.');
                            setVerificando(false);
                            navegar('/login');
                            return;
                        }

                        console.error('Error registrando compra:', error);
                        toast.error('No se pudo registrar la compra en la base de datos');
                    }
                }
            } else if (estadoRedireccion === 'processing') {
                toast('El pago está siendo procesado...', { icon: '⏳' });
            } else {
                setPagoExitoso(false);
                toast.error('El pago no se pudo completar');
            }

            // Desactivamos el estado de verificación
            setVerificando(false);
        };

        verificarEstadoPago();
    }, [parametrosBusqueda, navegar]);

    /**
     * @brief Redirige al usuario al catálogo de libros.
     * @fecha 2026-03-18
     * @description Se ejecuta cuando el usuario hace clic en el botón de continuar.
     * @returns {void} No devuelve nada.
     */
    const manejarContinuarComprando = () => {
        navegar('/catalogo');
    };

    /**
     * @brief Redirige al usuario a su página de perfil/compras.
     * @fecha 2026-03-18
     * @description Se ejecuta cuando el usuario quiere ver sus compras.
     * @returns {void} No devuelve nada.
     */
    const manejarVerCompras = () => {
        navegar('/perfil');
    };

    return (
        <div className="flex flex-col items-center w-screen min-h-screen bg-[#102216]">
            <Header />

            <div className="flex flex-col items-center justify-center flex-grow w-full max-w-2xl px-4 py-8">
                {verificando ? (
                    // Mostramos un mensaje de carga mientras verificamos el pago
                    <div className="text-green-400 text-xl">
                        Verificando el estado del pago...
                    </div>
                ) : pagoExitoso ? (
                    // Pantalla de éxito cuando el pago se completó
                    <>
                        {/* Icono de éxito */}
                        <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mb-6">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-black"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        <h1 className="text-white text-3xl sm:text-4xl font-bold mb-4 text-center">
                            ¡Pago Exitoso!
                        </h1>

                        <p className="text-gray-300 text-lg text-center mb-8">
                            Tu compra ha sido procesada correctamente.
                            Recibirás un correo de confirmación con los detalles de tu pedido.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                            <button
                                onClick={manejarVerCompras}
                                className="bg-green-600 hover:bg-green-700 text-black text-lg font-bold py-3 px-8 rounded-xl transition duration-300 ease-in-out flex-1"
                            >
                                Ver Mis Compras
                            </button>

                            <button
                                onClick={manejarContinuarComprando}
                                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-black text-lg font-bold py-3 px-8 rounded-xl transition duration-300 ease-in-out flex-1"
                            >
                                Seguir Comprando
                            </button>
                        </div>
                    </>
                ) : (
                    // Pantalla de error cuando el pago falló
                    <>
                        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-white"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>

                        <h1 className="text-white text-3xl sm:text-4xl font-bold mb-4 text-center">
                            Pago No Completado
                        </h1>

                        <p className="text-gray-300 text-lg text-center mb-8">
                            Hubo un problema al procesar tu pago.
                            Por favor, intenta de nuevo o usa otro método de pago.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                            <button
                                onClick={() => navegar('/carrito')}
                                className="bg-green-600 hover:bg-green-700 text-black text-lg font-bold py-3 px-8 rounded-xl transition duration-300 ease-in-out flex-1"
                            >
                                Volver al Carrito
                            </button>

                            <button
                                onClick={manejarContinuarComprando}
                                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-black text-lg font-bold py-3 px-8 rounded-xl transition duration-300 ease-in-out flex-1"
                            >
                                Seguir Comprando
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
