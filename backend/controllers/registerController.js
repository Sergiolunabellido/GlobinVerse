const conexionBD = require('../config/db');
const bcrypt = require('bcryptjs');


/**
 * @brief Registra un usuario nuevo con password encriptada.
 * @fecha 2026-01-12
 * @returns {Promise<void>} Respuesta JSON con estado del registro.
 */
async function registrarUsuario(req, res) {
    const { nombre, email, password } = req.body;
    let db;

    if (!nombre || nombre.trim().length < 2) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El nombre debe tener al menos 2 caracteres',
        });
    }

    if (!email || email.trim().length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El email es obligatorio',
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'El formato del email no es válido',
        });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La contraseña debe tener al menos 6 caracteres',
        });
    }

    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);
    if (!tieneMayuscula || !tieneNumero) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La contraseña debe tener al menos una mayúscula y un número',
        });
    }

    try {
        db = await conexionBD();
        await db.beginTransaction();

        const [usuario] = await db.execute('SELECT * FROM usuarios WHERE gmail = ?', [email]);
        if (usuario.length > 0) {
            await db.commit();
            return res.status(400).json({
                ok: false,
                mensaje: 'Ese email ya está registrado, inicie sesion o use otro email',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [rows] = await db.execute('INSERT INTO usuarios (nombre_usuario, gmail, contrasena) VALUES (?, ?, ?)',
             [nombre, email, hashedPassword]);

            await db.commit();
            return res.status(200).json({
                ok: true,
                mensaje: 'Usuario registrado correctamente',
            });
       
    }catch(e){
        if (db) {
            try {
                await db.rollback();
            } catch (_) {}
        }
        console.error(e);
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al registrar el usuario '
        });
    }
}

module.exports = { registrarUsuario };
