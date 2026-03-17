import Header from "../../Components/Header/header"
import {useNavigate} from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { renovarToken } from "../../utils/utils";

import toast from 'react-hot-toast';

/**
 * @brief Pagina de carrito con listado y resumen de compra.
 * @fecha 2026-02-25
 * @returns {JSX.Element} Vista del carrito.
 */
export default function Carrito(){

    const navigate = useNavigate();
    const yaCargadoRef = useRef(false);
    /**
     * @brief Vuelve al catalogo para seguir comprando.
     * @fecha 2026-02-25
     * @returns {void} No devuelve nada.
     */
    const handleClickCatalogo = () => {
        navigate('/catalogo');
    };

    const [libros, setLibros] = useState([]);
 
    const [cantidadesPorLibro, setCantidadesPorLibro] = useState({})
    
    const PRECIO_ENVIO = 5.99;

    /**
     * @brief Suma una unidad al libro indicado.
     * @fecha 2026-02-25
     * @returns {void} No devuelve nada.
     */
    const cantidadMas1 = ((idLibro)=>{
        setCantidadesPorLibro((prev) => ({
            ...prev,
            [idLibro]: (prev[idLibro] ?? 1) + 1
        }));
    })

    /**
     * @brief Elimina un libro del carrito en backend y refresca lista.
     * @fecha 2026-02-25
     * @returns {Promise<void>} No devuelve datos.
     */
    const eliminarLibro = (async (idLibro) => {
        try{
            await fetch("http://localhost:5000/eliminarLibroCarrito",{
                method: 'POST',
                headers: {
                    "Content-type": 'application/json', 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials : 'include',
                body: JSON.stringify({ id_libro: idLibro }),
            });
            await recogerLibrosCarrito();
        }catch(e){
            console.error("Error al eliminar el libro del carrito:  ", e)
        }
    })

    /**
     * @brief Resta una unidad y elimina si llega a cero.
     * @fecha 2026-02-25
     * @returns {void} No devuelve nada.
     */
    const cantidadMenos1 = ((idLibro)=>{
        setCantidadesPorLibro((prev) => {
            const actual = prev[idLibro] ?? 1;
            const siguiente = actual - 1;
            if (siguiente <= 0) {
                eliminarLibro(idLibro)
                // Quitar el libro del carrito cuando la cantidad llega a 0
                setLibros((prev) => prev.filter((l) => l.id_libro !== idLibro));
                const actualizado = { ...prev };
                delete actualizado[idLibro];
                return actualizado;
            }
            return { ...prev, [idLibro]: siguiente };
        });
    })

    // useMemo cachea el resultado y solo recalcula cuando 'libros' cambia
    const subtotal = useMemo(() => {
        return libros.reduce((total, libro) => {
            const cantidad = cantidadesPorLibro[libro.id_libro] ?? 1;
            return total + (parseFloat(libro.precio) || 0) * cantidad;
        }, 0);
    }, [libros, cantidadesPorLibro]);

    const precioTotal = useMemo(() => {
        return subtotal + PRECIO_ENVIO;
    }, [subtotal]);

    /**
     * @brief Carga los libros del carrito con control de token.
     * @fecha 2026-02-25
     * @returns {Promise<void>} No devuelve datos, solo actualiza estado.
     */
    const recogerLibrosCarrito = async () =>{

        try{


            let respuesta = await fetch("http://localhost:5000/librosCarrito",{
                method: 'POST',
                headers: {
                    "Content-type": 'application/json', 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials : 'include'
            });

            if(respuesta.status === 401){
                const tokenRenovado = await renovarToken();
                console.log(tokenRenovado)
                if(!tokenRenovado){
                    localStorage.removeItem('token');
                    navigate('/login')
                    toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                    return;
                }

                respuesta = await fetch("http://localhost:5000/librosCarrito",{
                    method: 'POST',
                    headers: {
                        "Content-type": 'application/json', 
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    credentials : 'include'
                });

            }

            const datos = await respuesta.json();
            console.log("Respuesta del backend:", datos);

            if(datos.ok && datos.libros && datos.libros.length > 0){
                setLibros(datos.libros);
                setCantidadesPorLibro((prev) => {
                    const actualizado = { ...prev };
                    datos.libros.forEach((libro) => {
                        if (actualizado[libro.id_libro] == null) {
                            actualizado[libro.id_libro] = 1;
                        }
                    });
                    return actualizado;
                });
            }else {
                console.log("No se cargaron libros:", datos.mensaje);
                toast.error(datos.mensaje || "Error al cargar el carrito");
            }
            
        }catch(e){
            console.error("Error al pedir los datos del usuario:  ", e)
        }

    }

    useEffect(() =>{
        if (yaCargadoRef.current) return;
        yaCargadoRef.current = true;
        recogerLibrosCarrito()
    }, [])

    return (
       <div className="body1 flex flex-col items-center w-screen min-h-screen bg-[#102216]">  
            <Header/>
            <div id="divPadreCarrito" className="flex flex-col gap-3 p-3 sm:p-5 w-full flex-grow">
                <div id="divTituloPedido" className="flex flex-col gap-2 sm:gap-3 items-start m-2 sm:m-5">
                    <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Mi carrito</h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300">Revisa tus articulos antes del pago</p>
                </div>
                <div id="divListaResumenPedido" className="flex flex-col lg:flex-row gap-5 justify-between w-full ">
                    <div id="divListaPedido" className="flex flex-col gap-4 sm:gap-5 w-full lg:w-[65%] xl:w-[70%] p-2">
                       {libros.map((libro) => (
                            <div key={libro.id_libro} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 w-full border border-solid rounded-xl border-gray-500">
                                <div className="flex items-center w-full sm:w-[60%] md:w-[55%] gap-3 sm:gap-5">
                                    <img src={libro.url_imagen} alt={libro.titulo} className="w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 rounded-lg object-cover flex-shrink-0"/>
                                    <div className="flex flex-col gap-1 sm:gap-2 items-start overflow-hidden">
                                        <p className="text-lg sm:text-xl md:text-2xl font-semibold  ">{libro.titulo}</p>
                                        <p className="text-sm sm:text-base md:text-lg text-gray-500">Por {libro.autor}</p>
                                        <p className="text-base sm:text-lg md:text-xl font-medium">${parseFloat(libro.precio).toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-[40%] md:w-[45%] gap-3 sm:gap-4 md:gap-6">
                                    <div className="flex items-center justify-between px-3 sm:px-4 w-28 sm:w-32 h-10 bg-gray-500 rounded-2xl">
                                        <button className="text-xl sm:text-2xl px-2" onClick={() => cantidadMenos1(libro.id_libro)}>-</button>
                                        <p className="text-base sm:text-lg md:text-xl font-medium">{cantidadesPorLibro[libro.id_libro] ?? 1}</p>
                                        <button className="text-xl sm:text-2xl px-2" onClick={() => cantidadMas1(libro.id_libro)}>+</button>
                                    </div>
                                    <div className="flex items-center justify-end gap-3 sm:gap-4">
                                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold whitespace-nowrap">
                                            ${((parseFloat(libro.precio) || 0) * (cantidadesPorLibro[libro.id_libro] ?? 1)).toFixed(2)}
                                        </h1>
                                        <button onClick={() => eliminarLibro(libro.id_libro)} className="p-1 hover:text-red-400 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-trash">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                <path d="M4 7l16 0" />
                                                <path d="M10 11l0 6" />
                                                <path d="M14 11l0 6" />
                                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                       ))}
                    </div>
                    <div id="divResumenPedido" className="flex flex-col justify-between lg:me-6 bg-[#1a3a25] w-full lg:w-[35%] xl:w-[30%] lg:max-w-[440px] lg:sticky lg:top-4 lg:self-start min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] rounded-xl shadow-xl">
                        <div id="divSubEnvio" className="flex flex-col gap-3 sm:gap-4 m-4 sm:m-5 items-start">

                            <h1 className="text-lg sm:text-xl md:text-2xl text-gray-300 font-bold">Resumen Pedido</h1>

                            <div id="divSubtotalPedido" className="flex items-center justify-between gap-3 w-full">
                                <p className="text-sm sm:text-base md:text-lg text-gray-300 font-bold">Subtotal: </p>
                                <p className="text-sm sm:text-base md:text-lg text-gray-300">${subtotal.toFixed(2)}</p>
                            </div>

                            <div id="divPrecioEnvio" className="flex items-center justify-between gap-3 w-full">
                                <p className="text-sm sm:text-base md:text-lg text-gray-300 font-bold">Precio envio: </p>
                                <p className="text-sm sm:text-base md:text-lg text-gray-300">${PRECIO_ENVIO.toFixed(2)}</p>
                            </div>

                        </div>
                        <hr className="border-gray-600" />
                        <div id="divTotalBotonesCompra" className="flex flex-col gap-4 sm:gap-5 m-4 sm:m-5 justify-between flex-grow">
                            <div id="divTotalPedido" className="flex items-center justify-between w-full">
                                <p className="text-base sm:text-lg md:text-xl font-bold text-gray-200">Total: </p>
                                <p className="text-base sm:text-lg md:text-xl text-gray-300">${precioTotal.toFixed(2)}</p>
                            </div>
                            <div id="divBotonesCompra" className="flex flex-col gap-3 sm:gap-4">
                                <button id="botonComprar" className="bg-green-600 hover:bg-green-700 text-black text-base sm:text-lg md:text-xl font-bold py-2.5 sm:py-3 px-4 sm:px-6 md:px-8 rounded-[10px] transition duration-300 ease-in-out w-full">
                                    Procesar Pago
                                </button>
                                <button id="botonSeguirComprando" onClick={handleClickCatalogo} className="text-green-600 hover:text-green-700 text-base sm:text-lg md:text-xl font-bold py-2 sm:py-3 transition duration-300 ease-in-out text-center">
                                    Continuar Compra
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
            
    )
}
