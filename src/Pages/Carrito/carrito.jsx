import Header from "../../Components/Header/header"
import {useNavigate} from "react-router-dom";
export default function Carrito(){

    const navigate = useNavigate();
    const handleClickCatalogo = () => {
        navigate('/catalogo');
    };


    return (
       <div className="body1 flex flex-col items-center w-screen h-full bg-[#102216]">  
            <Header/>
            <div id="divPadreCarrito" className="flex flex-col gap-3 p-5 w-screen h-full">
                <div id="divTituloPedido" className="flex flex-col gap-3 items-start m-5">
                    <h1 className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">Mi carrito</h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300">Revisa tus articulos antes del pago</p>
                </div>
                <div id="divListaResumenPedido" className="flex gap-5 justify-between w-[100%] h-full">
                    <div id="divListaPedido" className="flex flex-col gap-5 w[70%] h-[100%]">
                        <h1>hola</h1>
                    </div>
                    <div id="divResumenPedido" className="flex flex-col justify-between me-6 bg-[#1a3a25] h-[70%] w-[50%] lg:w-[25%] rounded-xl shadow-xl">
                        <div id="divSubEnvio" className="flex flex-col gap-4 m-4 items-start">

                            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-bold">Resumen Pedido</h1>

                            <div id="divSubtotalPedido" className="flex items-center justify-between gap-3 w-[100%]">
                                <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-300 font-bold">Subtotal: </p>
                                <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-300">precioSubtotal</p>
                            </div>

                            <div id="divPrecioEnvio" className="flex items-center justify-between  gap-3 w-[100%]">
                                <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-300 font-bold">Precio envio: </p>
                                <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-300">precioEnvio</p>
                            </div>

                        </div>
                        <hr />
                        <div id="divTotalBotonesCompra"  className="flex flex-col gap-5 m-4 justify-between h-[50%]">
                            <div id="divTotalPedido" className="flex items-center justify-between w-[100%]">
                                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-200">Total: </p>
                                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300">precioTotal</p>
                            </div>
                            <div id="divBotonesCompra" className="flex flex-col gap-4 h-[50%]">
                                <button id="botonComprar" className="bg-green-600 hover:bg-green-700 text-black text-sm sm:text-base md:text-lg lg:text-xl font-bold py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-[10px] transition duration-300 ease-in-out">
                                    Procesar Pago
                                </button>
                                <button id="botonSeguirComprando" onClick={handleClickCatalogo} className="text-green-600 hover:text-green-700 text-sm sm:text-base md:text-lg lg:text-xl font-bold py-2 sm:py-3 transition duration-300 ease-in-out">
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