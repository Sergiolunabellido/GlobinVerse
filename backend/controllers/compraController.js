const conexionBD = require('../config/db');
async function guardarLibroComprado(req, res){
    const idLibro = req.body.id_libro;
    const idUsuario = req.id_usuario

    let conexion ;

    try{
        conexion = await conexionBD();

        const [registroExistente] = await conexion.execute(
            "SELECT 1 FROM compra WHERE id_user = ? AND id_libro = ? LIMIT 1",
            [idUsuario, idLibro]
        );

        if (registroExistente && registroExistente.length > 0) {
            return res.status(200).json({ ok: true, duplicado: true });
        }
        
        const [filas] = await conexion.execute("INSERT INTO compra (id_user, id_libro) VALUES (?,?)", [idUsuario, idLibro])
        console.log("Se ha insertado el libro en compras del usuario: ", idUsuario);
        return res.status(200).json({ ok: true, filas });
    }catch(e){
        console.log("Error al insertar el libro en compras del usuario: ", req.id_usuario)
        return res.status(500).json({ ok: false, mensaje: "Error al guardar la compra" });
    } finally {
        if (conexion) await conexion.end();
    }
}

async function registrarCompraDesdeCarrito(req, res) {
    const idUsuario = req.id_usuario;

    let conexion;

    try {
        conexion = await conexionBD();

        const [filasCarrito] = await conexion.execute(
            "SELECT id_libro FROM carrito WHERE id_user = ?",
            [idUsuario]
        );

        if (!filasCarrito || filasCarrito.length === 0) {
            return res.status(200).json({ ok: false, mensaje: "El carrito está vacío" });
        }

        await conexion.beginTransaction();

        for (const fila of filasCarrito) {
            const [existe] = await conexion.execute(
                "SELECT 1 FROM compra WHERE id_user = ? AND id_libro = ? LIMIT 1",
                [idUsuario, fila.id_libro]
            );

            if (existe && existe.length > 0) continue;

            await conexion.execute(
                "INSERT INTO compra (id_user, id_libro) VALUES (?,?)",
                [idUsuario, fila.id_libro]
            );
        }

        await conexion.commit();

        return res.status(200).json({ ok: true, insertados: filasCarrito.length });
    } catch (e) {
        if (conexion) {
            try {
                await conexion.rollback();
            } catch (_) {}
        }
        console.log("Error al registrar la compra desde el carrito del usuario: ", req.id_usuario);
        return res.status(500).json({ ok: false, mensaje: "Error al registrar la compra" });
    } finally {
        if (conexion) await conexion.end();
    }
}

module.exports = {
    guardarLibroComprado,
    registrarCompraDesdeCarrito
}
