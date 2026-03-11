const request = require('supertest');

jest.mock('../config/db', () => {
  return jest.fn(async () => ({
    execute: async (query, params) => {
      const q = query.toLowerCase();

      if (q.includes('select * from usuarios where nombre_usuario')) {
        return [[{ id_usuario: 1, nombre_usuario: 'test', contrasena: 'hashed' }]];
      }

      if (q.includes('update usuarios set token')) {
        return [{ affectedRows: 1 }];
      }

      if (q.includes('insert into usuarios')) {
        return [{ affectedRows: 1 }];
      }

      if (q.includes('select id_usuario, token from usuarios where id_usuario')) {
        return [[{ id_usuario: 1, token: 'refresh-token' }]];
      }

      if (q.includes('select * from usuarios where id_usuario')) {
        return [[{ id_usuario: 1, nombre_usuario: 'test', gmail: 'test@test.com' }]];
      }

      if (q.includes('select * from libros limit 6')) {
        return [[{ id_libro: 1, titulo: 'Libro 1' }]];
      }

      if (q.includes('select * from libros')) {
        return [[{ id_libro: 1, titulo: 'Libro 1' }]];
      }

      if (q.includes('select * from libros where id_libro')) {
        return [[{ id_libro: 1, titulo: 'Libro 1' }]];
      }

      if (q.includes('select * from libros where lower(titulo)')) {
        return [[{ id_libro: 1, titulo: 'Libro 1' }]];
      }

      if (q.includes('from favoritos')) {
        return [[{ id_favorito: 1, id_libro: 1, titulo: 'Libro 1' }]];
      }

      if (q.includes('from compra')) {
        return [[{ id_compra: 1, titulo: 'Libro 1' }]];
      }

      if (q.includes('select l.* from libros')) {
        return [[{ id_libro: 1, titulo: 'Libro 1', precio: 10 }]];
      }

      if (q.includes('insert into favoritos')) {
        return [{ affectedRows: 1 }];
      }

      if (q.includes('delete from favoritos')) {
        return [{ affectedRows: 1 }];
      }

      if (q.includes('insert into carrito')) {
        return [{ affectedRows: 1 }];
      }

      if (q.includes('delete from carrito')) {
        return [{ affectedRows: 1 }];
      }

      return [[]];
    },
    end: async () => {},
  }));
});

jest.mock('bcryptjs', () => ({
  compare: jest.fn(async () => true),
  hash: jest.fn(async () => 'hashed'),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'token'),
  verify: jest.fn(() => ({ id_usuario: 1 })),
}));

const app = require('../app');

describe('Backend routes', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_REFRESH_SECRET = 'refresh';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  test('POST /register registers user', async () => {
    const res = await request(app)
      .post('/register')
      .send({ nombre: 'a', email: 'a@a.com', password: '1234' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /login returns token', async () => {
    const res = await request(app)
      .post('/login')
      .send({ usuario: 'test', contrasena: '1234' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toBe('token');
  });

  test('POST /refresh returns new token', async () => {
    const res = await request(app)
      .post('/refresh')
      .set('Cookie', ['refreshToken=refresh-token']);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toBe('token');
  });

  test('POST /usuarios requires auth', async () => {
    const res = await request(app).post('/usuarios');
    expect(res.status).toBe(401);
  });

  test('POST /usuarios returns user when authed', async () => {
    const res = await request(app)
      .post('/usuarios')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.filas)).toBe(true);
  });

  test('POST /librosPublicos returns featured books', async () => {
    const res = await request(app).post('/librosPublicos');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.filas)).toBe(true);
  });

  test('POST /libros returns all books', async () => {
    const res = await request(app).post('/libros');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /libroId returns one book', async () => {
    const res = await request(app)
      .post('/libroId')
      .send({ id_libro: 1 });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /libroTitulo returns books by title', async () => {
    const res = await request(app)
      .post('/libroTitulo')
      .send({ titulo_libro: 'libro' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /librosFiltrados returns filtered books', async () => {
    const res = await request(app)
      .post('/librosFiltrados')
      .send({ listaCategorias: ['Fantasia'] });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /librosFavoritos requires auth', async () => {
    const res = await request(app).post('/librosFavoritos');
    expect(res.status).toBe(401);
  });

  test('POST /librosFavoritos returns favorites when authed', async () => {
    const res = await request(app)
      .post('/librosFavoritos')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /anadirFavorito adds favorite when authed', async () => {
    const res = await request(app)
      .post('/anadirFavorito')
      .set('Authorization', 'Bearer token')
      .send({ id_libro: 1 });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /librosComprados returns purchases when authed', async () => {
    const res = await request(app)
      .post('/librosComprados')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /anadirLibroCarrito adds to cart when authed', async () => {
    const res = await request(app)
      .post('/anadirLibroCarrito')
      .set('Authorization', 'Bearer token')
      .send({ id_libro: 1 });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /librosCarrito returns cart when authed', async () => {
    const res = await request(app)
      .post('/librosCarrito')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /eliminarLibroCarrito removes from cart when authed', async () => {
    const res = await request(app)
      .post('/eliminarLibroCarrito')
      .set('Authorization', 'Bearer token')
      .send({ id_libro: 1 });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /cerrarSesion returns ok', async () => {
    const res = await request(app)
      .post('/cerrarSesion')
      .set('Cookie', ['refreshToken=refresh-token']);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
