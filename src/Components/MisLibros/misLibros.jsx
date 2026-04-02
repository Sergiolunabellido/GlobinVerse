import { useState, useEffect } from "react";

export default function MisLibros() {
    const [librosSubidos, setLibrosSubidos] = useState(0);
    const [librosComprados, setLibrosComprados] = useState(0);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [misLibros, setMisLibros] = useState([]);
    const [cargando, setCargando] = useState(true);

    const [formData, setFormData] = useState({
        isbn: "",
        titulo: "",
        autor: "",
        categoria: "",
        editorial: "",
        existencias: "",
        url_imagen: "",
        descripcion: "",
        idioma: "",
        precio: "",
        cantidad_paginas: "",
        fecha_publicacion: ""
    });

    // Obtener datos del usuario al cargar
    useEffect(() => {
        obtenerLibrosUsuario();
    }, []);

    const obtenerLibrosUsuario = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Obtener libros subidos por el usuario
            const respuesta = await fetch("http://localhost:5000/librosUsuario", {
                method: 'POST',
                headers: {
                    "Content-type": 'application/json', 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const datos = await respuesta.json();
            if (datos.ok) {
                setMisLibros(datos.libros || []);
                setLibrosSubidos(datos.libros?.length || 0);
            }
            setCargando(false);
        } catch (error) {
            console.error("Error al obtener datos:", error);
            setCargando(false);
        }
    };

    const manejarCambioFormulario = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const manejarEnvioFormulario = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            
            const respuesta = await fetch("http://localhost:5000/subir-libro", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const datos = await respuesta.json();
            if (datos.ok) {
                // Limpiar formulario y cerrar modal
                setFormData({
                    isbn: "",
                    titulo: "",
                    autor: "",
                    categoria: "",
                    editorial: "",
                    existencias: "",
                    url_imagen: "",
                    descripcion: "",
                    idioma: "",
                    precio: "",
                    cantidad_paginas: "",
                    fecha_publicacion: ""
                });
                setModalAbierto(false);
                // Recargar datos
                obtenerLibrosUsuario();
            } else {
                alert("Error al subir el libro: " + datos.mensaje);
            }
        } catch (error) {
            console.error("Error al subir libro:", error);
            alert("Error al subir el libro");
        }
    };

    const cerrarModal = () => {
        setModalAbierto(false);
    };

    return (
        <div className="w-full bg-[#102216] text-white p-8 min-h-screen">
            <h1 className="text-4xl font-bold mb-8">Mis Libros</h1>

            {/* Paneles de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Panel 1: Libros Subidos */}
                <div className="bg-[#1a3a25] rounded-lg p-6 border border-green-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Libros Subidos</p>
                            <h2 className="text-5xl font-bold text-green-500">{librosSubidos}</h2>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                    </div>
                </div>

                {/* Panel 2: Libros Comprados */}
                <div className="bg-[#1a3a25] rounded-lg p-6 border border-green-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Libros Comprados</p>
                            <h2 className="text-5xl font-bold text-green-500">{librosComprados}</h2>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Panel para subir libro */}
            <div 
                onClick={() => setModalAbierto(true)}
                className="border-2 border-dashed border-green-500 rounded-lg p-12 mb-8 bg-[#1a3a25]/30 hover:bg-[#1a3a25]/50 cursor-pointer transition-colors flex flex-col items-center justify-center gap-4"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                <p className="text-xl text-green-500 font-semibold">Subir Nuevo Libro</p>
                <p className="text-gray-400 text-sm">Haz clic para agregar un nuevo libro</p>
            </div>

            {/* Modal/Pop-up */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#102216] rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-green-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Subir Nuevo Libro</h2>
                            <button 
                                onClick={cerrarModal}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={manejarEnvioFormulario} className="space-y-4">
                            {/* Fila 1: ISBN y Título */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">ISBN</label>
                                    <input 
                                        type="text" 
                                        name="isbn" 
                                        value={formData.isbn}
                                        onChange={manejarCambioFormulario}
                                        className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">Título</label>
                                    <input 
                                        type="text" 
                                        name="titulo" 
                                        value={formData.titulo}
                                        onChange={manejarCambioFormulario}
                                        className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Fila 2: Autor y Categoría */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">Autor</label>
                                    <input 
                                        type="text" 
                                        name="autor" 
                                        value={formData.autor}
                                        onChange={manejarCambioFormulario}
                                        className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">Categoría</label>
                                    <input 
                                        type="text" 
                                        name="categoria" 
                                        value={formData.categoria}
                                        onChange={manejarCambioFormulario}
                                        className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Fila 3: Editorial y Existencias */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">Editorial</label>
                                    <input 
                                        type="text" 
                                        name="editorial" 
                                        value={formData.editorial}
                                        onChange={manejarCambioFormulario}
                                        className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">Existencias</label>
                                    <input 
                                        type="number" 
                                        name="existencias" 
                                        value={formData.existencias}
                                        onChange={manejarCambioFormulario}
                                        className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* URL Imagen */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">URL Imagen</label>
                                <input 
                                    type="url" 
                                    name="url_imagen" 
                                    value={formData.url_imagen}
                                    onChange={manejarCambioFormulario}
                                    className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                    required
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-300">Descripción</label>
                                <textarea 
                                    name="descripcion" 
                                    value={formData.descripcion}
                                    onChange={manejarCambioFormulario}
                                    rows="4"
                                    className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 resize-none"
                                    required
                                />
                            </div>

                            {/* Fila 4: Idioma y Precio */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">Idioma</label>
                                    <input 
                                        type="text" 
                                        name="idioma" 
                                        value={formData.idioma}
                                        onChange={manejarCambioFormulario}
                                        className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">Precio</label>
                                    <input 
                                        type="number" 
                                        name="precio" 
                                        value={formData.precio}
                                        onChange={manejarCambioFormulario}
                                        step="0.01"
                                        className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Fila 5: Cantidad de páginas y Fecha de publicación */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">Cantidad de Páginas</label>
                                    <input 
                                        type="number" 
                                        name="cantidad_paginas" 
                                        value={formData.cantidad_paginas}
                                        onChange={manejarCambioFormulario}
                                        className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-300">Fecha de Publicación</label>
                                    <input 
                                        type="date" 
                                        name="fecha_publicacion" 
                                        value={formData.fecha_publicacion}
                                        onChange={manejarCambioFormulario}
                                        className="w-full bg-[#1a3a25] border border-green-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4 pt-6">
                                <button 
                                    type="submit"
                                    className="flex-1 bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                                >
                                    Subir Libro
                                </button>
                                <button 
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lista de mis libros */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Mis Libros Subidos</h2>
                
                {cargando ? (
                    <p className="text-gray-400">Cargando libros...</p>
                ) : misLibros.length === 0 ? (
                    <div className="text-center p-8 bg-[#1a3a25]/30 rounded-lg">
                        <p className="text-gray-400">No has subido libros aún. ¡Sube tu primer libro!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {misLibros.map((libro) => (
                            <div key={libro.id} className="bg-[#1a3a25] rounded-lg overflow-hidden border border-green-700 hover:border-green-500 transition-colors">
                                {libro.url_imagen && (
                                    <img src={libro.url_imagen} alt={libro.titulo} className="w-full h-48 object-cover" />
                                )}
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1 truncate">{libro.titulo}</h3>
                                    <p className="text-green-500 text-sm mb-2">{libro.autor}</p>
                                    <p className="text-gray-400 text-xs mb-3">{libro.editorial}</p>
                                    
                                    <div className="flex justify-between items-center text-sm mb-3">
                                        <span className="text-yellow-500 font-semibold">${libro.precio}</span>
                                        <span className="text-gray-400">{libro.existencias} en stock</span>
                                    </div>
                                    
                                    <button className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded transition-colors text-sm font-semibold">
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}