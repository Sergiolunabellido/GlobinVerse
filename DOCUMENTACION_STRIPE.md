# Stripe en este proyecto (Checkout + registro de compra)

Este documento explica cómo está integrado Stripe en el proyecto y los cambios realizados hoy para que, tras un pago correcto, se guarden los libros comprados en la base de datos y se maneje correctamente el caso de usuario no autenticado.

## 1) Flujo general de pago

### 1.1 Desde dónde se inicia el pago

Hay 2 formas de llegar al pago:

1. **Comprar desde el carrito**
   - El usuario va a `src/Pages/Carrito/carrito.jsx` y pulsa “Procesar pago”.
   - Se navega a `/checkout` pasando `montoTotal` por `navigate('/checkout', { state: { montoTotal } })`.

2. **Comprar un libro desde su ficha**
   - El usuario pulsa “Comprar Libro” en `src/Pages/Libros/paginaLibro.jsx`.
   - Se navega a `/checkout` pasando `montoTotal` con el precio del libro.
   - Además, se guarda en `sessionStorage` qué libro se está comprando para poder registrarlo luego en BD:
     - `sessionStorage.setItem('checkout_libros', JSON.stringify([id]))`.

### 1.2 Checkout: creación del PaymentIntent (backend)

- Pantalla: `src/Pages/Checkout/checkout.jsx`
- Endpoint backend: `POST http://localhost:5000/api/pagos/intentoPago`
- Ruta backend: `backend/routes/pagos.js`

El Checkout llama al backend para crear un **PaymentIntent** en Stripe y recibir el `client_secret`:

- Se envía `monto` (en euros) y `moneda` (`eur`).
- El backend convierte a céntimos y valida:
  - `const montoEnCentimos = Math.round(Number(monto) * 100);`
  - si `montoEnCentimos` no es válido o `<= 0`, devuelve `400`.
- Stripe crea el intent con `amount: montoEnCentimos`.
- El backend responde `{ secretoCliente: intentoPago.client_secret }`.

### 1.3 Formulario de pago (frontend)

- Componente: `src/Components/FormularioPago/formularioPago.jsx`

Se usa Stripe Elements con `PaymentElement`:

- `stripe.confirmPayment({ confirmParams: { return_url: `${window.location.origin}/pago-exitoso` } })`
- Stripe redirige a `/pago-exitoso` al finalizar.

### 1.4 Pantalla de confirmación (pago exitoso)

- Pantalla: `src/Pages/PagoExitoso/pagoExitoso.jsx`

Stripe redirige a esa URL añadiendo parámetros en la query:

- `redirect_status` (por ejemplo `succeeded`, `processing`, etc.)
- `payment_intent` (id del PaymentIntent)

En `pagoExitoso.jsx`:

- Si `redirect_status === 'succeeded'`:
  - Se muestra “Pago completado exitosamente”.
  - Se ejecuta el **registro de la compra en BD** (ver sección 3).
- Si el backend responde `401` (usuario sin token o token inválido/expirado):
  - Se muestra el toast: “Tienes que iniciar sesion primero para realizar una compra.”
  - Se redirige a `/login`.

## 2) Claves de Stripe: modo test

Las claves están configuradas en modo **test**:

- Frontend: `.env`
  - `REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...`
- Backend: `backend/.env`
  - `STRIPE_SECRET_KEY=sk_test_...`

Esto significa:

- Los pagos son **simulados**.
- No se cobra dinero real.
- Se pueden usar tarjetas de prueba de Stripe (por ejemplo `4242 4242 4242 4242`) y se reflejarán solo en el Dashboard de Stripe en “Test mode”.

## 3) Registro de compra en base de datos (lo implementado hoy)

### 3.1 Backend: controlador de compras

Archivo: `backend/controllers/compraController.js`

Funciones relevantes:

1. `registrarCompraDesdeCarrito(req, res)`
   - Lee los `id_libro` del carrito del usuario.
   - Inserta en `compra` y, si aplica, añade `id_user_libro`.
   - Usa transacción (`beginTransaction/commit/rollback`) para asegurar consistencia.

2. `registrarCompraLibros(req, res)`
   - Recibe una lista de libros desde el frontend: `{ libros: [id1, id2, ...] }`.
   - Inserta cada libro en `compra` y, si existe en `librosusuario`, también guarda `id_user_libro`.
   - Elimina del carrito los IDs que vienen en la petición.
   - Usa transacción (`beginTransaction/commit/rollback`).

> Importante: se corrigió el nombre de la tabla usada en los inserts.
> En el proyecto, para listar compras ya se usaba `compra` (singular) en `backend/controllers/librosController.js`,
> mientras que el controller de compra estaba intentando insertar en `compras` (plural), lo que provocaba fallos al guardar.

### 3.2 Backend: endpoints

Archivo: `backend/routes/auth.js`

Se usan endpoints protegidos con `authMiddleware`:

- `POST /registrarCompraCarrito` → llama a `registrarCompraDesdeCarrito`
- `POST /registrarCompraLibros` → llama a `registrarCompraLibros`

Además se corrigió un typo que impedía registrar la ruta:

- `routen.post(...)` → `router.post(...)`

### 3.3 Frontend: lógica de registro en `pagoExitoso.jsx`

Archivo: `src/Pages/PagoExitoso/pagoExitoso.jsx`

Cuando el pago es `succeeded`, el frontend intenta registrar la compra:

1. Se evita ejecutar el registro más de una vez:
   - `registroIniciadoRef` (ref de React)
   - además, una marca por `payment_intent` en `sessionStorage` (`compra_registrada_<id>`) para bloquear reintentos (incluye estado `in_progress` para evitar dobles ejecuciones en StrictMode).

2. Se hacen peticiones protegidas con `Authorization: Bearer <token>` y soporte de refresh:
   - helper `peticionProtegida()`
   - si devuelve `401`, intenta `renovarToken()` (`src/utils/utils.js`)
   - si no se puede renovar, se trata como no autenticado → `/login` con mensaje

3. Se distinguen 2 casos:

**A) Compra desde ficha de libro**
- Si existe `sessionStorage.checkout_libros`, se llama:
  - `POST /registrarCompraLibros` con `{ libros: [id1, id2, ...] }`
- Al terminar se borra `checkout_libros`.

**B) Compra desde carrito**
- Si NO existe `checkout_libros`, se llama:
  - `POST /registrarCompraCarrito`

## 4) Arreglo: “No se puede proceder con el pago desde la ficha del libro”

Archivo: `src/Pages/Libros/paginaLibro.jsx`

Qué pasaba:

- Se hacía una comprobación incorrecta:
  - `if (libro.length === 0)` pero `libro` es un **objeto**, no un array.
- El precio se obtenía con `Number(libro.precio)`:
  - si el precio venía como string con coma (ej. `19,99`), eso daba `NaN`.
  - En `Checkout`, `NaN` hace que `!montoTotal` sea true y redirige al carrito, por eso “no dejaba pagar”.

Cómo se arregló:

- Se valida correctamente `if (!libro)`.
- Se parsea el precio de forma robusta:
  - `parseFloat(String(libro.precio).replace(',', '.'))`
- Se evita iniciar checkout sin token:
  - si no hay token → toast y `navigate('/login')`.

## 5) Checklist rápido para probar

1. Arranca backend y frontend.
2. Inicia sesión (para tener `token` y cookie de refresh si aplica).
3. Prueba compra desde:
   - Carrito → paga → vuelve a `/pago-exitoso` → debe insertar en `compra`.
   - Ficha de libro → “Comprar Libro” → paga → vuelve a `/pago-exitoso` → debe insertar en `compra`.
4. Prueba sin token:
   - al intentar registrar compra tras éxito → debe mostrar mensaje y mandar a `/login`.
