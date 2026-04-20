# Esquema mental — Stripe en el proyecto (de inicio a guardado en BD)

Este esquema describe **todo el flujo** de Stripe tal y como está implementado en este proyecto: desde que el usuario inicia el pago hasta que se registra la compra en la base de datos.

---

## 0) Vista global (qué pasa y dónde)

- **Frontend**

  - Inicia el checkout pasando `montoTotal` a `/checkout`.
  - Renderiza Stripe Elements (`PaymentElement`).
  - Confirma el pago con `stripe.confirmPayment()` y redirige a `/pago-exitoso`.
  - Tras éxito (`redirect_status=succeeded`) llama a endpoints protegidos para **guardar compras en BD**.
- **Backend**

  - Crea el **PaymentIntent** en Stripe y devuelve `client_secret`.
  - Expone endpoints protegidos para insertar compras en la tabla `compra`.
- **Stripe**

  - Procesa el intento de pago.
  - Redirige a `return_url` con parámetros (`redirect_status`, `payment_intent`).

---

## 1) Entrada al pago (Frontend)

Hay 2 formas de llegar al pago:

### 1.A) Carrito → Checkout

- Archivo: `src/Pages/Carrito/carrito.jsx`
- Qué hace:
  - Calcula `subtotal` y `precioTotal` (incluye envío).
  - Al pulsar “Procesar pago”, navega a:
    - `navigate('/checkout', { state: { montoTotal: precioTotal } })`
- Lo esencial:
  - Aquí solo se decide **cuánto** se va a pagar.
  - Todavía **no** se habla con Stripe.

### 1.B) Ficha del libro → Checkout

- Archivo: `src/Pages/Libros/paginaLibro.jsx`
- Qué hace:
  - Valida autenticación:
    - Si no hay `token` → toast y `navigate('/login')`.
  - Valida que el libro está cargado.
  - Parsea el precio de forma robusta:
    - `parseFloat(String(libro.precio).replace(',', '.'))`
  - Guarda en `sessionStorage` qué libro se está pagando:
    - `sessionStorage.setItem('checkout_libros', JSON.stringify([id]))`
  - Navega a:
    - `navigate('/checkout', { state: { montoTotal: precio } })`
- Lo esencial:
  - `checkout_libros` permite registrar la compra luego en BD incluso si el libro **no** estaba en el carrito.
  - Si `libro.precio` venía con coma (ej. `19,99`), `Number('19,99')` daba `NaN` y eso rompía el flujo del checkout.

---

## 2) Checkout: creación del PaymentIntent (Frontend → Backend → Stripe)

### 2.1 Pantalla de Checkout

- Archivo: `src/Pages/Checkout/checkout.jsx`
- Qué hace (pasos):
  - Lee el importe:
    - `const montoTotal = location.state?.montoTotal`
  - Valida:
    - Si no hay `montoTotal` o `montoTotal <= 0` → toast y vuelve a `/carrito`.
  - Pide al backend crear un PaymentIntent:
    - `POST http://localhost:5000/api/pagos/intentoPago`
    - Body: `{ monto: montoTotal, moneda: 'eur' }`
  - Recibe:
    - `{ secretoCliente: <client_secret> }`
  - Monta Stripe Elements:
    - `<Elements stripe={...} options={{ clientSecret: secretoCliente, appearance: ... }}>`

### 2.2 Endpoint de pagos

- Archivo: `backend/routes/pagos.js`
- Ruta: `POST /api/pagos/intentoPago`
- Qué hace:
  - Recibe `{ monto, moneda }`
  - Convierte euros a céntimos (unidad mínima):
    - `montoEnCentimos = Math.round(Number(monto) * 100)`
  - Valida:
    - si `montoEnCentimos` no es número o `<= 0` → `400 { error: 'Monto inválido' }`
  - Crea el PaymentIntent:
    - `stripe.paymentIntents.create({ amount: montoEnCentimos, currency: moneda, automatic_payment_methods: { enabled: true } })`
  - Responde al frontend con `client_secret`.
- Lo esencial:
  - Stripe exige `amount` en **céntimos** (o unidad mínima).
  - Si no conviertes bien (o envías `NaN`) el intent falla o tu frontend acaba redirigiendo.

---

## 3) Confirmación de pago en Stripe Elements (Frontend)

- Archivo: `src/Components/FormularioPago/formularioPago.jsx`
- Qué hace:
  - Renderiza `<PaymentElement />`
  - En submit:
    - `stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/pago-exitoso` } })`
  - Stripe procesa el pago y redirige a `/pago-exitoso`.
- Lo esencial:
  - El frontend no “se inventa” el éxito: Stripe decide y redirige.

---

## 4) Pantalla de resultado: `PagoExitoso` (Frontend)

- Archivo: `src/Pages/PagoExitoso/pagoExitoso.jsx`

### 4.1 Qué lee

- Parámetros de la URL:
  - `redirect_status` (ej: `succeeded`, `processing`, etc.)
  - `payment_intent` (id del PaymentIntent)

### 4.2 Qué decide

- Si `redirect_status === 'succeeded'`:
  - Muestra éxito.
  - Lanza el registro de compra en BD (sección 5) **una sola vez**.
- Si `processing`:
  - Mensaje de “procesando”.
- Si falla:
  - Muestra error.

### 4.3 Cómo evita doble ejecución (puntos críticos)

- `registroIniciadoRef` (ref de React) evita repetir por re-render inmediato.
- Marca adicional en `sessionStorage` por `payment_intent`:
  - `compra_registrada_<paymentIntentId>`
  - Usa estado `in_progress` para bloquear reintentos (por ejemplo, doble ejecución en StrictMode) y luego `1` cuando termina.

---

## 5) Registro de compra en BD (Frontend → Backend protegido)

El registro ocurre **después** de que Stripe confirme el pago y redirija a `/pago-exitoso`.

### 5.1 Helper de petición protegida + refresh

- Archivo: `src/Pages/PagoExitoso/pagoExitoso.jsx`
- Función: `peticionProtegida(url, cuerpo)`
- Qué hace:
  - Envía la request con:
    - `Authorization: Bearer <token>`
    - `credentials: 'include'` (para cookie de refresh)
  - Si el backend responde `401`:
    - intenta `renovarToken()` (archivo `src/utils/utils.js`, llama a `POST /refresh`)
    - si no hay refresh válido → lanza un error con `status = 401`

### 5.2 Decidir “qué guardar” según el origen del pago

El frontend distingue 2 escenarios:

**A) Compra desde ficha de libro**

- Si existe `sessionStorage.checkout_libros`:
  - Toma todos los ids y llama:
    - `POST /registrarCompraLibros` con `{ libros: [id1, id2, ...] }`
  - Al terminar:
    - borra `checkout_libros`

**B) Compra desde carrito**

- Si NO existe `checkout_libros`:
  - Llama:
    - `POST /registrarCompraCarrito`

### 5.3 Caso usuario sin token / token inválido (401)

- Si tras reintento/refresh sigue llegando `401`:
  - Se muestra el mensaje:
    - “Tienes que iniciar sesion primero para realizar una compra.”
  - Se elimina el token local y se redirige a:
    - `/login`

---

## 6) Endpoints de compra y auth (Backend)

### 6.1 Rutas

- Archivo: `backend/routes/auth.js`
- Endpoints protegidos con `authMiddleware`:
  - `POST /registrarCompraCarrito` → `registrarCompraDesdeCarrito()`
  - `POST /registrarCompraLibros` → `registrarCompraLibros()`

### 6.2 Middleware JWT

- Archivo: `backend/middleware/auth.middleware.js`
- Qué hace:
  - Lee `Authorization: Bearer <ACCESS_TOKEN>`.
  - Verifica JWT (`JWT_SECRET`).
  - Si es válido:
    - añade `req.id_usuario` (y `req.user`) y llama `next()`.
  - Si no:
    - responde `401`.

---

## 7) Controllers de compra (Backend + MySQL)

- Archivo: `backend/controllers/compraController.js`

### 7.1 `registrarCompraDesdeCarrito(req, res)` (desde carrito)

- Busca los libros del carrito del usuario:
  - `SELECT id_libro FROM carrito WHERE id_user = ?`
- Si el carrito está vacío:
  - responde `200 { ok: false, mensaje: "El carrito está vacío" }`
- Si hay libros:
  - inicia transacción:
    - por cada libro, intenta guardar en `compra`
    - si el libro pertenece a un usuario (`librosusuario`), guarda también `id_user_libro`
  - hace `commit` o `rollback` si hay error
- Lo esencial:
  - Guarda “lo que había en carrito” como compras del usuario.

### 7.2 `registrarCompraLibros(req, res)` (lista enviada desde checkout)

- Recibe:
  - `req.body.libros` (array de IDs)
- Comportamiento:
  - Inicia transacción
  - Recorre la lista y hace `INSERT INTO compra`
  - Si el libro existe en `librosusuario`, incluye `id_user_libro`
  - Elimina del carrito los IDs procesados
  - Hace `commit` o `rollback`

### 7.3 Bug real que se corrigió

- Se intentaba insertar en `compras` (plural) pero el proyecto usa `compra` (singular) en consultas del historial de compras.
- Resultado: el guardado fallaba.
- Solución: unificar y usar `compra` en todo el controller de compra.

---

## 8) Variables de entorno (modo test)

Las claves son de Stripe en **modo test**:

- Frontend: `.env`
  - `REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...`
- Backend: `backend/.env`
  - `STRIPE_SECRET_KEY=sk_test_...`

Consecuencia:

- Se pueden usar tarjetas de prueba.
- No hay cargos reales (todo queda en “Test mode” de Stripe).

---

## 9) Checklist de prueba (rápido)

1. Iniciar sesión (para tener `token` + cookie refresh si aplica).
2. Probar:
   - Carrito → Checkout → pagar → `/pago-exitoso` → debe insertar en tabla `compra`.
   - Ficha de libro → Comprar Libro → pagar → `/pago-exitoso` → debe insertar en tabla `compra`.
3. Probar sin token:
   - Tras pago exitoso, al intentar registrar compra → mensaje y redirección a `/login`.
