// Rutas de autenticación (Login, Registro) - CommonJS
const express = require('express');
const { comprobarLogin } = require('../controllers/authController');
const { registrarUsuario } = require('../controllers/registerController');
const { refreshAccessToken } = require('../controllers/refreshTokenController')
const {listarUsuariosId, cerrarSesion} = require('../controllers/usersController')
const {guardarLibroComprado, registrarCompraDesdeCarrito, registrarCompraLibros} = require('../controllers/compraController')
const {libros, libroId, libroTitulo, librosCompletos,librosFavoritosUser, librosCompradosUser, eliminarFavoritoPorId, librosFiltradosGenero, anadirFavorito} = require('../controllers/librosController')
const authMiddleware = require( '../middleware/auth.middleware');
const {añadirLibroCarrito, librosCarrito, eliminarLibroCarrito} = require('../controllers/cartController')
const router = express.Router();


router.post('/login', comprobarLogin);
router.post('/register', registrarUsuario);
router.post('/refresh', refreshAccessToken); 
router.post('/usuarios',authMiddleware, listarUsuariosId )
router.post('/librosFavoritos', authMiddleware, librosFavoritosUser)
router.post('/anadirFavorito', authMiddleware, anadirFavorito)
router.post('/librosComprados', authMiddleware, librosCompradosUser)
router.post('/libros', librosCompletos)
router.post('/eliminarLibro', authMiddleware, eliminarFavoritoPorId)
router.post('/cerrarSesion', cerrarSesion )
router.post('/librosPublicos', libros)
router.post('/libroId', libroId)
router.post('/libroTitulo', libroTitulo)
router.post('/librosFiltrados', librosFiltradosGenero)
router.post('/anadirLibroCarrito', authMiddleware ,añadirLibroCarrito)
router.post('/librosCarrito', authMiddleware ,librosCarrito)
router.post('/eliminarLibroCarrito', authMiddleware ,eliminarLibroCarrito)
router.post('/guardarLibroCarrito', authMiddleware, guardarLibroComprado)
router.post('/registrarCompraCarrito', authMiddleware, registrarCompraDesdeCarrito)
router.post('/registrarCompraLibros', authMiddleware, registrarCompraLibros)


module.exports = router;


