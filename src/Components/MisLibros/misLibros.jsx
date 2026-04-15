import { useState, useEffect } from "react";
import toast from 'react-hot-toast';

export default function MisLibros() {
    const [librosSubidos, setLibrosSubidos] = useState(0);
    const [librosComprados, setLibrosComprados] = useState(0);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [misLibros, setMisLibros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [libroEditando, setLibroEditando] = useState(null);
    const [dialogoConfirmacion, setDialogoConfirmacion] = useState({ abierto: false, libroId: null, titulo: '' });

    // Obtener datos del usuario al cargar
    useEffect(() => {
        obtenerLibrosUsuario();
    }, []);

    const obtenerLibrosUsuario = async () => {
        try {
            
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
            toast.error("Error al obtener datos:", error);
            setCargando(false);
        }
    };


    const crearLibro = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            // Obtener valores de los inputs del formulario
            const formData = {
                isbn: document.getElementById('isbn').value,
                titulo: document.getElementById('titulo').value,
                autor: document.getElementById('autor').value,
                categoria: document.getElementById('categoria').value,
                editorial: document.getElementById('editorial').value,
                existencias: parseInt(document.getElementById('existencias').value),
                url_imagen: document.getElementById('url_imagen').value,
                descripcion: document.getElementById('descripcion').value,
                idioma: document.getElementById('idioma').value,
                precio: parseFloat(document.getElementById('precio').value),
                paginas: parseInt(document.getElementById('paginas').value),
                publicacion: document.getElementById('publicacion').value
            };

            const respuesta = await fetch("http://localhost:5000/subirLibroPropio", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const datos = await respuesta.json();

            if (!datos.ok) {
                toast.error(datos.mensaje || "Error al subir el libro");
                return;
            }

            // Éxito - Mostrar mensaje de éxito
            toast.success("¡Libro subido exitosamente!");

            // Limpiar los valores del formulario
            document.getElementById('isbn').value = '';
            document.getElementById('titulo').value = '';
            document.getElementById('autor').value = '';
            document.getElementById('categoria').value = '';
            document.getElementById('editorial').value = '';
            document.getElementById('existencias').value = '';
            document.getElementById('url_imagen').value = '';
            document.getElementById('descripcion').value = '';
            document.getElementById('idioma').value = '';
            document.getElementById('precio').value = '';
            document.getElementById('paginas').value = '';
            document.getElementById('publicacion').value = '';

            setModalAbierto(false);

            // Recargar datos
            obtenerLibrosUsuario();
        } catch (error) {
            console.error("Error al subir libro:", error);
            toast.error("Error al subir el libro. Intenta nuevamente");
        }
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setLibroEditando(null);
    };

    const abrirModalCrear = () => {
        setLibroEditando(null);
        setModalAbierto(true);
    };

    const abrirModalEditar = (libro) => {
        setLibroEditando(libro);
        setModalAbierto(true);
    };

    const abrirDialogoEliminar = (id_libro, titulo) => {
        setDialogoConfirmacion({ abierto: true, libroId: id_libro, titulo });
    };

    const cerrarDialogoEliminar = () => {
        setDialogoConfirmacion({ abierto: false, libroId: null, titulo: '' });
    };

    const eliminarLibro = async () => {
        const { libroId } = dialogoConfirmacion;
        if (!libroId) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Debes iniciar sesión para eliminar un libro');
            cerrarDialogoEliminar();
            return;
        }

        try {
            const respuesta = await fetch("http://localhost:5000/eliminarLibroPropio", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_libro: libroId })
            });

            const datos = await respuesta.json();

            if (!datos.ok) {
                toast.error(datos.mensaje || "Error al eliminar el libro");
                return;
            }

            toast.success("Libro eliminado exitosamente");
            obtenerLibrosUsuario();
        } catch (error) {
            console.error("Error al eliminar libro:", error);
            toast.error("Error al eliminar el libro. Intenta nuevamente");
        } finally {
            cerrarDialogoEliminar();
        }
    };

    const editarLibro = async (e) => {
        e.preventDefault();

        if (!libroEditando) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Debes iniciar sesión para editar un libro');
            return;
        }

        try {
            const formData = {
                id_libro: libroEditando.id_libro,
                isbn: document.getElementById('isbn').value,
                titulo: document.getElementById('titulo').value,
                autor: document.getElementById('autor').value,
                categoria: document.getElementById('categoria').value,
                editorial: document.getElementById('editorial').value,
                existencias: parseInt(document.getElementById('existencias').value),
                url_imagen: document.getElementById('url_imagen').value,
                descripcion: document.getElementById('descripcion').value,
                idioma: document.getElementById('idioma').value,
                precio: parseFloat(document.getElementById('precio').value),
                paginas: parseInt(document.getElementById('paginas').value),
                publicacion: document.getElementById('publicacion').value
            };

            const respuesta = await fetch("http://localhost:5000/editarLibroPropio", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const datos = await respuesta.json();

            if (!datos.ok) {
                toast.error(datos.mensaje || "Error al editar el libro");
                return;
            }

            toast.success("Libro actualizado exitosamente");
            cerrarModal();
            obtenerLibrosUsuario();
        } catch (error) {
            console.error("Error al editar libro:", error);
            toast.error("Error al editar el libro. Intenta nuevamente");
        }
    };

    const manejarEnvioFormulario = async (e) => {
        if (libroEditando) {
            await editarLibro(e);
        } else {
            await crearLibro(e);
        }
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
                onClick={abrirModalCrear}
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
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
                    <div className="bg-gradient-to-br from-[#102216] to-[#1a3a25] rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-green-600 shadow-2xl shadow-green-900/50">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-green-700/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${libroEditando ? 'bg-amber-600/20' : 'bg-green-600/20'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={libroEditando ? 'text-amber-400' : 'text-green-400'}>
                                        {libroEditando ? (
                                            <>
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </>
                                        ) : (
                                            <>
                                                <path d="M12 5v14M5 12h14"/>
                                            </>
                                        )}
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-white">{libroEditando ? 'Editar Libro' : 'Subir Nuevo Libro'}</h2>
                            </div>
                            <button
                                onClick={cerrarModal}
                                className="text-gray-400 hover:text-white hover:bg-red-600/20 p-2 rounded-lg transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={manejarEnvioFormulario} className="space-y-5">
                            {/* Fila 1: ISBN y Título */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="group">
                                    <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">ISBN</label>
                                    <input
                                        id="isbn"
                                        type="text"
                                        name="isbn"
                                        defaultValue={libroEditando?.isbn || ''}
                                        placeholder="Ej: 978-3-16-148410-0"
                                        className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">Título</label>
                                    <input
                                        id="titulo"
                                        type="text"
                                        name="titulo"
                                        defaultValue={libroEditando?.titulo || ''}
                                        placeholder="Ej: El Señor de los Anillos"
                                        className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Fila 2: Autor y Categoría */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="group">
                                    <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">Autor</label>
                                    <input
                                        id="autor"
                                        type="text"
                                        name="autor"
                                        defaultValue={libroEditando?.autor || ''}
                                        placeholder="Ej: J.R.R. Tolkien"
                                        className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">Categoría</label>
                                    <input
                                        id="categoria"
                                        type="text"
                                        name="categoria"
                                        defaultValue={libroEditando?.categoria || ''}
                                        placeholder="Ej: Fantasía"
                                        className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Fila 3: Editorial y Existencias */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="group">
                                    <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">Editorial</label>
                                    <input
                                        id="editorial"
                                        type="text"
                                        name="editorial"
                                        defaultValue={libroEditando?.editorial || ''}
                                        placeholder="Ej: Minotauro"
                                        className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">Existencias</label>
                                    <input
                                        id="existencias"
                                        type="number"
                                        name="existencias"
                                        defaultValue={libroEditando?.existencias || ''}
                                        placeholder="Ej: 10"
                                        min="0"
                                        className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* URL Imagen */}
                            <div className="group">
                                <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">URL Imagen</label>
                                <input
                                    id="url_imagen"
                                    type="url"
                                    name="url_imagen"
                                    defaultValue={libroEditando?.url_imagen || ''}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                    required
                                />
                            </div>

                            {/* Descripción */}
                            <div className="group">
                                <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">Descripción</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    defaultValue={libroEditando?.descripcion || ''}
                                    placeholder="Describe brevemente el contenido del libro..."
                                    rows="4"
                                    className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                                    required
                                />
                            </div>

                            {/* Fila 4: Idioma y Precio */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="group">
                                    <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">Idioma</label>
                                    <input
                                        id="idioma"
                                        type="text"
                                        name="idioma"
                                        defaultValue={libroEditando?.idioma || ''}
                                        placeholder="Ej: Español"
                                        className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">Precio ($)</label>
                                    <input
                                        id="precio"
                                        type="number"
                                        name="precio"
                                        defaultValue={libroEditando?.precio || ''}
                                        placeholder="Ej: 29.99"
                                        step="0.01"
                                        min="0"
                                        className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Fila 5: Cantidad de páginas y Fecha de publicación */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="group">
                                    <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">Cantidad de Páginas</label>
                                    <input
                                        id="paginas"
                                        type="number"
                                        name="paginas"
                                        defaultValue={libroEditando?.paginas || ''}
                                        placeholder="Ej: 423"
                                        min="1"
                                        className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="group">
                                    <label className="block text-sm font-semibold mb-2 text-green-400 group-focus-within:text-green-300 transition-colors">Fecha de Publicación</label>
                                    <input
                                        id="publicacion"
                                        type="date"
                                        name="publicacion"
                                        defaultValue={libroEditando?.publicacion ? libroEditando.publicacion.split('T')[0] : ''}
                                        className="w-full bg-[#0d1f13] border border-green-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4 pt-6 border-t border-green-700/50">
                                <button
                                    type="submit"
                                    className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                        libroEditando
                                            ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30'
                                            : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {libroEditando ? (
                                            <>
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </>
                                        ) : (
                                            <>
                                                <path d="M12 5v14M5 12h14"/>
                                            </>
                                        )}
                                    </svg>
                                    {libroEditando ? 'Guardar Cambios' : 'Subir Libro'}
                                </button>
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all border border-gray-600"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Diálogo de confirmación para eliminar */}
            {dialogoConfirmacion.abierto && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gradient-to-br from-[#102216] to-[#1a3a25] rounded-xl p-8 max-w-md w-full border border-red-600 shadow-2xl shadow-red-900/50 animate-fadeIn">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">¿Eliminar libro?</h3>
                            <p className="text-gray-400 mb-6">
                                Estás a punto de eliminar <span className="text-white font-semibold">"{dialogoConfirmacion.titulo}"</span>. Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={cerrarDialogoEliminar}
                                    className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-lg transition-all border border-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={eliminarLibro}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                    Eliminar
                                </button>
                            </div>
                        </div>
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
                            <div key={libro.id_libro} className="bg-[#1a3a25] rounded-lg overflow-hidden border border-green-700 hover:border-green-500 transition-colors">
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
                                    
                                    <button
                                        onClick={() => abrirModalEditar(libro)}
                                        className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => abrirDialogoEliminar(libro.id_libro, libro.titulo)}
                                        className="w-full mt-2 bg-red-700 hover:bg-red-600 text-white py-2 rounded transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                        Eliminar
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