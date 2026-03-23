const axios = require('axios');
const conexionBD = require('../config/db');

/**
 * Valida si una cadena es una fecha válida en formato YYYY, YYYY-MM o YYYY-MM-DD.
 */
function isValidDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  const regex = /^\d{4}(-\d{2}(-\d{2})?)?$/;
  return regex.test(dateString);
}

/**
 * Formatea una fecha a YYYY-MM-DD.
 */
function formatDate(dateString) {
  if (!isValidDate(dateString)) return null;
  const parts = dateString.split('-');
  const year = parts[0];
  const month = parts.length > 1 ? parts[1] : '01';
  const day = parts.length > 2 ? parts[2] : '01';
  return `${year}-${month}-${day}`;
}

/**
 * Genera URL de portada válida.
 * Prioriza Google Books. Si no hay, usa Open Library (ISBN) como fallback.
 */
function getCoverUrl(volumeInfo) {
  // 1️⃣ Google Books
  let url = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || null;
  if (url) {
    url = url.replace('http://', 'https://'); // fuerza HTTPS
    // Normaliza zoom
    url = url.replace(/zoom=\d/, 'zoom=2');
    return url;
  }

  // 2️⃣ Open Library fallback
  const isbn = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
  )?.identifier;

  if (isbn) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
  }

  return null; // sin imagen
}

/**
 * Obtiene libros de Google Books y los inserta en la base de datos.
 */
async function fetchAndInsertBooks() {
  let connection;
  try {
    connection = await conexionBD();
    const queries = 'abcdefghijklmnopqrstuvwxyz'.split('');
    for (const query of queries) {
      let retries = 3;
      while (retries > 0) {
        try {
          console.log(`Buscando libros para: ${query}`);
          const response = await axios.get(
            `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40`
          );
          const books = response.data.items;
          if (!books) break;

          for (const book of books) {
            const v = book.volumeInfo;
            if (!v) continue;

            const isbn = v.industryIdentifiers?.find(
              (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
            )?.identifier;
            if (!isbn) continue;

            const titulo = v.title || 'Título desconocido';
            const autor = v.authors ? v.authors.join(', ') : 'Autor desconocido';
            const categoria = v.categories ? v.categories[0] : 'Categoría desconocida';
            const editorial = v.publisher || 'Editorial desconocida';
            const existencias = Math.floor(Math.random() * 20) + 1;

            // --- URL de imagen ahora fiable ---
            const url_imagen = getCoverUrl(v);

            const descripcion = v.description || 'Sin descripción.';
            const idioma = v.language || 'Desconocido';
            const precio = book.saleInfo?.listPrice?.amount || Math.floor(Math.random() * 50) + 10;
            const paginas = v.pageCount || 0;
            let publicacion = v.publishedDate || null;
            if (publicacion) publicacion = formatDate(publicacion);

            try {
              await connection.execute(
                `INSERT INTO libros 
                (isbn, titulo, autor, categoria, editorial, existencias, url_imagen, descripcion, idioma, precio, paginas, publicacion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  titulo=VALUES(titulo),
                  autor=VALUES(autor),
                  categoria=VALUES(categoria),
                  editorial=VALUES(editorial),
                  existencias=VALUES(existencias),
                  url_imagen=VALUES(url_imagen),
                  descripcion=VALUES(descripcion),
                  idioma=VALUES(idioma),
                  precio=VALUES(precio),
                  paginas=VALUES(paginas),
                  publicacion=VALUES(publicacion)`,
                [isbn, titulo, autor, categoria, editorial, existencias, url_imagen, descripcion, idioma, precio, paginas, publicacion]
              );
              console.log(`Libro "${titulo}" insertado/actualizado.`);
            } catch (err) {
              console.error(`Error insertando "${titulo}":`, err.message);
            }
          }

          break; // éxito
        } catch (error) {
          console.error(`Error fetch query "${query}", reintentando (${retries - 1} retries)`);
          retries--;
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      await new Promise((r) => setTimeout(r, 1000)); // retardo entre queries
    }
  } catch (error) {
    console.error('Error conectando a la base de datos:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión a la DB cerrada.');
    }
  }
}

fetchAndInsertBooks();