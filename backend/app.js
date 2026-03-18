const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const pagosRoutes = require('./routes/pagos');

const app = express();

/**
 * @brief Configuración de middlewares para la aplicación Express.
 * @fecha 2026-03-18
 * @description Habilita CORS para permitir peticiones desde el frontend en localhost:3000,
 * parsea el cuerpo de las peticiones como JSON y habilita el manejo de cookies.
 */
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

/**
 * @brief Registro de rutas de la API.
 * @fecha 2026-03-18
 * @description Las rutas de autenticación están en la raíz (/login, /registro, etc.)
 * y las rutas de pagos están bajo el prefijo /api/pagos.
 */
app.use('/', authRoutes);
app.use('/api/pagos', pagosRoutes);

module.exports = app;
