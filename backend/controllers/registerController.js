const conexionBD = require('../config/db');
const bcrypt = require('bcryptjs');


/**
 * @brief Registra un usuario nuevo con password encriptada.
 * @fecha 2026-01-12
 * @returns {Promise<void>} Respuesta JSON con estado del registro.
 */
async function registrarUsuario(req, res) {
    const { nombre, email, password } = req.body;
    try {
        const db = await conexionBD();

        const [usuario] = await db.execute('SELECT * FROM usuarios WHERE gmail = ?', [email]);
        if (usuario.length > 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Ese email ya está registrado, inicie sesion o use otro email',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [rows] = await db.execute('INSERT INTO usuarios (nombre_usuario, gmail, contrasena) VALUES (?, ?, ?)',
             [nombre, email, hashedPassword]);
        
            return res.status(200).json({
                ok: true,
                mensaje: 'Usuario registrado correctamente',
            });
       
    }catch(e){
        console.error(e);
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al registrar el usuario '
        });
    }
}

module.exports = { registrarUsuario };
