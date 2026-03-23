const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');

const PORT = 5000;

app.listen(
  PORT,
  /**
   * @brief Arranca el servidor en el puerto configurado.
   * @fecha 2026-01-08
   * @returns {void} No devuelve nada.
   */
  () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  }
);

