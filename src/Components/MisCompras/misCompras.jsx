import { Suspense, useState, useEffect } from "react"
import { renovarToken } from "../../utils/utils";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import {Libro3D} from '../../utils/utils'
import { OrbitControls } from "@react-three/drei";

/**
 * @brief Lista las compras realizadas por el usuario.
 * @fecha 2026-02-05
 * @returns {JSX.Element} Vista con el historial de compras.
 */
export default function MisCompras(){

    const navigate = useNavigate()
    const [compras, setCompras] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');

    /**
     * @brief Pide al backend las compras del usuario.
     * @fecha 2026-02-05
     * @returns {Promise<void>} No devuelve datos, solo actualiza estado.
     */
    const obtenerDatosCompra = async () => {
        try {
            let respuesta = await fetch("http://localhost:5000/librosComprados", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                credentials: "include",
            });

            if (respuesta.status === 401) {
                const tokenRenovado = await renovarToken();
                if (!tokenRenovado) {
                    localStorage.removeItem("token");
                    navigate("/login");
                    return;
                }

                respuesta = await fetch("http://localhost:5000/librosComprados", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${tokenRenovado}`,
                    },
                    credentials: "include",
                });
            }

            const datos = await respuesta.json();
            if (datos.ok && Array.isArray(datos.filas)) {
                setCompras(datos.filas);
                setMensaje('');
            } else {
                setCompras([]);
                setMensaje(datos.mensaje || 'No tienes compras realizadas');
            }
        } catch (e) {
            setCompras([]);
            setMensaje('Error al cargar las compras');
            console.error("Error al pedir compras:", e);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerDatosCompra() 
    }, [])

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    if (cargando) {
        return (
            <div className="flex flex-col w-full min-h-[400px] p-4">
                <h1 className="text-2xl lg:text-4xl font-bold text-white mb-6">Compras Realizadas</h1>
                <div className="flex items-center justify-center py-20">
                    <p className="text-green-400 text-xl">Cargando compras...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-[400px] p-4">
            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-6">Compras Realizadas</h1>
            
            {mensaje && (
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-400 text-lg">{mensaje}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-full">
                {compras.map((libro, index) => (
                    <div
                        key={`${libro.id_libro ?? "libro"}-${index}`} 
                        className="flex flex-col md:flex-row bg-[#1a3a25] border border-green-600/50 shadow-lg shadow-green-600/20 rounded-xl overflow-hidden"
                    >
                        <div className="w-full md:w-32 lg:w-40 h-48 md:h-auto flex-shrink-0">
                            <Canvas
                                frameloop="demand"
                                dpr={[1.6, 1.5]}
                                gl={{ antialias: true, powerPreference: "high-performance" }}
                                camera={{ position: [0, 0.5, 3.6], fov: 35 }}
                            >
                                <ambientLight intensity={0.7} />
                                <directionalLight position={[2.2, 2.8, 2]} intensity={1.1} />
                                <Suspense fallback={null}>
                                    <Libro3D libro={libro} />
                                </Suspense>
                                <OrbitControls enableRotate={true} enablePan={false} />
                            </Canvas>
                        </div>
                        
                        <div className="flex flex-col justify-between p-4 flex-grow">
                            <div className="space-y-2">
                                <h3 className="text-white font-semibold text-lg line-clamp-2">{libro.titulo}</h3>
                                <p className="text-gray-400 text-sm">{libro.categoria}</p>
                                <p className="text-gray-500 text-xs">{libro.editorial}</p>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-green-600/30 space-y-1">
                                <p className="text-green-400 text-sm">
                                    <span className="text-gray-500">Pedido: </span>
                                    #{libro.id_compra}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    <span className="text-gray-500">Fecha: </span>
                                    {formatearFecha(libro.fecha)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}