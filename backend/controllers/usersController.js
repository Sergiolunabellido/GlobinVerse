const conexionBD = require('../config/db');
const jwt = require('jsonwebtoken')
/**
 * @brief Lista todos los usuarios.
 * @fecha 2026-02-05
 * @returns {Promise<void>} Respuesta JSON con la lista.
 */
async function listarUsuarios(req, res){
    let conexion;

    try{
        conexion = await conexionBD();
        await conexion.beginTransaction();

        const [filas] = conexion.execute("SELECT * FROM usuarios")
        await conexion.commit();
        res.status(200).json({
            ok: true,
            filas: filas
        })
    }catch(e){
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (_) {}
        }
        res.status(400).json({ok:false, mensaje:"Error al listar los usuarios"})
    }
}

/**
 * @brief Devuelve el usuario segun el id del token.
 * @fecha 2026-02-05
 * @returns {Promise<void>} Respuesta JSON con el usuario.
 */
async function listarUsuariosId(req, res){
    let conexion;

    try{
        conexion = await conexionBD();
        await conexion.beginTransaction();

        const [filasPorId] = await conexion.execute('SELECT * FROM usuarios where id_usuario = ?',
            [req.id_usuario]
        )
        

        if(filasPorId.length === 0){
            await conexion.commit();
            return res.status(404).json({ok:false, mensaje:"Usuario no encontrado"})
        }

        await conexion.commit();
        return res.status(200).json({
            ok: true,
            filas: filasPorId
        })
    }catch(e){
       if (conexion) {
            try {
                await conexion.rollback();
            } catch (_) {}
        }
       return res.status(500).json({ok:false, mensaje:"Error al listar los usuarios"})
    }
};


/**
 * @brief Cierra la sesion y limpia el refresh token.
 * @fecha 2026-02-05
 * @returns {Promise<void>} Respuesta JSON de cierre.
 */
async function cerrarSesion(req, res){
    let conexion;
    const refreshToken = req.cookies.refreshToken;
    try{

         if (!refreshToken) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
            });

            return res.status(200).json({
                ok: true,
                mensaje: 'Sesión cerrada',
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        conexion = await conexionBD();
        await conexion.beginTransaction();

        const [usuario] = await conexion.execute('SELECT token from usuarios where id_usuario = ? LIMIT 1', [decoded.id_usuario])

        if (usuario.length > 0 && usuario[0].token === refreshToken) {
            const [resultado] = await conexion.execute(
                'UPDATE usuarios SET token = NULL WHERE id_usuario = ? LIMIT 1',
                [decoded.id_usuario]
            );

            if (resultado.affectedRows <= 0) {
                await conexion.commit();
                return res.status(404).json({
                    ok: false,
                    mensaje: 'No se ha podido cerrar sesión',
                });
            }
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
        });


        await conexion.commit();
        return res.status(200).json({
            ok: true,
        })

    }catch(e) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (_) {}
        }
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
        });

        return res.status(200).json({
            ok: true,
            mensaje: 'Sesión cerrada',
        });

    }
}

module.exports= {
    listarUsuariosId,
    listarUsuarios,
    cerrarSesion
}
