const conexionBD = require('../config/db');

function normalizarIdsLibros(lista) {
  if (!Array.isArray(lista)) return [];
  const ids = [];
  for (const v of lista) {
    const n = Number(v);
    if (Number.isInteger(n) && n > 0) ids.push(n);
  }
  return [...new Set(ids)];
}

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

async function guardarLibroComprado(req, res) {
  const idLibro = req.body.id_libro;
  const idUsuario = req.id_usuario;

  let conexion;

  try {
    conexion = await conexionBD();

    const [registroExistente] = await conexion.execute(
      'SELECT 1 FROM compra WHERE id_user = ? AND id_libro = ? LIMIT 1',
      [idUsuario, idLibro]
    );

    if (registroExistente && registroExistente.length > 0) {
      await conexion.execute('DELETE FROM carrito WHERE id_user = ? AND id_libro = ?', [idUsuario, idLibro]);
      return res.status(200).json({ ok: true, duplicado: true });
    }

    const [filas] = await conexion.execute('INSERT INTO compra (id_user, id_libro) VALUES (?,?)', [
      idUsuario,
      idLibro,
    ]);

    await conexion.execute('DELETE FROM carrito WHERE id_user = ? AND id_libro = ?', [idUsuario, idLibro]);

    console.log('Se ha insertado el libro en compras del usuario: ', idUsuario);
    return res.status(200).json({ ok: true, filas });
  } catch (e) {
    console.log('Error al insertar el libro en compras del usuario: ', req.id_usuario);
    return res.status(500).json({ ok: false, mensaje: 'Error al guardar la compra' });
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
      `SELECT l.id_libro, l.titulo, l.precio
       FROM carrito c
       JOIN libros l ON l.id_libro = c.id_libro
       WHERE c.id_user = ?`,
      [idUsuario]
    );

    if (!filasCarrito || filasCarrito.length === 0) {
      return res.status(200).json({ ok: false, mensaje: 'El carrito estÃ¡ vacÃ­o' });
    }

    await conexion.beginTransaction();

    for (const fila of filasCarrito) {
      const [existe] = await conexion.execute('SELECT 1 FROM compra WHERE id_user = ? AND id_libro = ? LIMIT 1', [
        idUsuario,
        fila.id_libro,
      ]);

      if (existe && existe.length > 0) continue;

      await conexion.execute('INSERT INTO compra (id_user, id_libro) VALUES (?,?)', [idUsuario, fila.id_libro]);
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

async function registrarCompraLibros(req, res) {
  const idUsuario = req.id_usuario;
  const idsLibros = normalizarIdsLibros(req.body?.libros);

  if (idsLibros.length === 0) {
    return res.status(400).json({ ok: false, mensaje: 'Lista de libros invÃ¡lida' });
  }

  let conexion;

  try {
    conexion = await conexionBD();

    const libros = await obtenerLibrosPorIds(conexion, idsLibros);
    if (!libros || libros.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'No se han encontrado libros' });
    }

    await conexion.beginTransaction();

    for (const idLibro of idsLibros) {
      const [existe] = await conexion.execute('SELECT 1 FROM compra WHERE id_user = ? AND id_libro = ? LIMIT 1', [
        idUsuario,
        idLibro,
      ]);

      if (existe && existe.length > 0) continue;

      await conexion.execute('INSERT INTO compra (id_user, id_libro) VALUES (?,?)', [idUsuario, idLibro]);
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
  guardarLibroComprado,
  registrarCompraDesdeCarrito,
  registrarCompraLibros,
};
