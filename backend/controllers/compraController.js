const conexionBD = require('../config/db');

/**
 * Limpia y normaliza una lista de IDs de libros, eliminando duplicados y valores inválidos.
 * @param {Array} lista - Array de IDs (puede contener strings o números)
 * @returns {number[]} - Array de IDs válidos y únicos
 */
function normalizarIdsLibros(lista) {
  if (!Array.isArray(lista)) return [];
  const ids = [];
  for (const v of lista) {
    const n = Number(v);
    if (Number.isInteger(n) && n > 0) ids.push(n);
  }
  return [...new Set(ids)];
}

/**
 * Consulta la base de datos para obtener información de libros por sus IDs.
 * @param {Object} conexion - Conexión a la base de datos
 * @param {number[]} idsLibros - Array de IDs de libros a buscar
 * @returns {Promise<Array>} - Array con objetos de libros (id_libro, titulo, precio)
 */
async function obtenerLibrosPorIds(conexion, idsLibros) {
  const ids = normalizarIdsLibros(idsLibros);
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [filas] = await conexion.execute(
    `SELECT id_libro, titulo, precio FROM libros WHERE id_libro IN (${placeholders})`,
    ids
  );
  return Array.isArray(filas) ? filas : [];
}

/**
 * Registra la compra de todos los libros que están en el carrito del usuario.
 * Inserta cada libro en la tabla 'compra' (saltando los que ya existen),
 * luego vacía el carrito. Usa transacción para garantizar consistencia.
 * @param {Object} req - Request con id_usuario
 * @param {Object} res - Response con ok y número de libros insertados
 * @returns {JSON} - Respuesta con resultado de la operación
 */
async function registrarCompraDesdeCarrito(req, res) {
  const idUsuario = req.id_usuario;

  let conexion;

  try {
    conexion = await conexionBD();

    const [filasCarrito] = await conexion.execute(
      `SELECT l.id_libro, l.titulo, l.precio
       FROM carrito c
       JOIN libros l ON l.id_libro = c.id_libro
       WHERE c.id_user = ?`,
      [idUsuario]
    );

    if (!filasCarrito || filasCarrito.length === 0) {
      return res.status(200).json({ ok: false, mensaje: 'El carrito esta vacio' });
    }

    await conexion.beginTransaction();

    for (const fila of filasCarrito) {
    
      //Compruebo si el id del libro pertenece a un usuario especifico. Si pertenece a un usuario, se inserta el id del usuario en la tabla compra, 
      // sino se inserta sin el id del usuario.
      const [idUserLibro] = await conexion.execute('SELECT id_user from librosusuario where id_libro = ? LIMIT 1', [
        fila.id_libro,
      ]);

      if (idUserLibro.length > 0) {
        await conexion.execute('INSERT INTO compra (id_user, id_libro, id_user_libro) VALUES (?,?,?)', [
          idUsuario,
          fila.id_libro,
          idUserLibro[0].id_user,
        ]);
      } else {
        await conexion.execute('INSERT INTO compra (id_user, id_libro) VALUES (?,?)', [idUsuario, fila.id_libro]);
      }
    
    }

    await conexion.execute('DELETE FROM carrito WHERE id_user = ?', [idUsuario]);

    await conexion.commit();

    return res.status(200).json({ ok: true, insertados: filasCarrito.length });
  } catch (e) {
    if (conexion) {
      try {
        await conexion.rollback();
      } catch (_) {}
    }
    console.log('Error al registrar la compra desde el carrito del usuario: ', req.id_usuario);
    return res.status(500).json({ ok: false, mensaje: 'Error al registrar la compra' });
  } finally {
    if (conexion) await conexion.end();
  }
}

/**
 * Registra la compra de una lista específica de libros enviada en el body.
 * Valida los IDs, consulta los libros existentes, inserta los no comprados
 * en la tabla 'compra' y elimina los comprados del carrito.
 * @param {Object} req - Request con id_usuario y libros: [id1, id2, ...]
 * @param {Object} res - Response con ok y total de libros procesados
 * @returns {JSON} - Respuesta con resultado de la operación
 */
async function registrarCompraLibros(req, res) {
  const idUsuario = req.id_usuario;
  const idsLibros = normalizarIdsLibros(req.body?.libros);

  if (idsLibros.length === 0) {
    return res.status(400).json({ ok: false, mensaje: 'Lista de libros invalida' });
  }

  let conexion;

  try {
    conexion = await conexionBD();

    await conexion.beginTransaction();

    for (const idLibro of idsLibros) {
    
      //Compruebo si el id del libro pertenece a un usuario especifico. Si pertenece a un usuario, se inserta el id del usuario en la tabla compra, 
      // sino se inserta sin el id del usuario.
      const [idUserLibro] = await conexion.execute('SELECT id_user from librosusuario where id_libro = ? LIMIT 1', [
        idLibro,
      ]);

      if (idUserLibro.length > 0) {
        await conexion.execute('INSERT INTO compra (id_user, id_libro, id_user_libro) VALUES (?,?,?)', [
          idUsuario,
          idLibro,
          idUserLibro[0].id_user,
        ]);
      } else {
        await conexion.execute('INSERT INTO compra (id_user, id_libro) VALUES (?,?)', [idUsuario, idLibro]);
      }
    
    }

    const placeholders = idsLibros.map(() => '?').join(',');
    await conexion.execute(`DELETE FROM carrito WHERE id_user = ? AND id_libro IN (${placeholders})`, [
      idUsuario,
      ...idsLibros,
    ]);

    await conexion.commit();

    return res.status(200).json({ ok: true, total: idsLibros.length });
  } catch (e) {
    if (conexion) {
      try {
        await conexion.rollback();
      } catch (_) {}
    }
    console.log('Error al registrar la compra de libros del usuario: ', req.id_usuario);
    return res.status(500).json({ ok: false, mensaje: 'Error al registrar la compra' });
  } finally {
    if (conexion) await conexion.end();
  }
}

module.exports = {

  registrarCompraDesdeCarrito,
  registrarCompraLibros,
};
