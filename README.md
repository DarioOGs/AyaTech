# AyaTech — Alevinos Nueva Vida el Deseo

Plataforma web para que la Finca Nueva Vida el Deseo publique la disponibilidad de alevinos,
reciba pedidos, controle el inventario y las ventas, y envíe reportes por WhatsApp — sin perder
información aunque se caiga la conexión a internet.

Práctica Empresarial · Corporación Universitaria Uniremington · Equipo AyaTech.

## Tecnología

| Capa | Tecnología |
|---|---|
| Interfaz | React + TypeScript + Vite (funciona como app instalable, PWA) |
| Base de datos | Firebase Firestore (con sincronización sin conexión activada) |
| Autenticación del personal | Firebase Authentication, inicio de sesión con Google |
| Hosting | Firebase Hosting (capa gratuita) |
| Reportes | Enlace `wa.me` con el mensaje ya redactado (sin costo, sin API de pago) |

El cliente que hace un pedido **no necesita cuenta**: se identifica con su cédula en cada
pedido. Solo el personal (vendedor/administrador) inicia sesión con Google.

## 1. Antes de programar: crear el proyecto en Firebase

1. Entra a [console.firebase.google.com](https://console.firebase.google.com) con tu cuenta de
   Google y crea un proyecto nuevo (por ejemplo `ayatech-alevinos`).
2. En el menú lateral:
   - **Build → Firestore Database** → Crear base de datos → modo producción.
   - **Build → Authentication** → pestaña "Sign-in method" → habilita **Google**.
   - **Build → Hosting** → clic en "Comenzar" (no hace falta desplegar todavía).
3. Ve a **Configuración del proyecto** (ícono de engranaje) → pestaña "Tus apps" → agrega una
   app web (ícono `</>`). Copia los valores que te da (`apiKey`, `authDomain`, etc.).

## 2. Configurar el proyecto local

```
npm install
cp .env.example .env
```

Abre `.env` y pega ahí los valores que copiaste de Firebase.

```
npm run dev
```

Abre la URL que te muestre la terminal (normalmente `http://localhost:5173`). Verás la vista de
cliente; para ver el panel interno entra a `http://localhost:5173/#admin`.

## 3. Crear al primer administrador

La primera vez, la colección `usuarios` está vacía, así que nadie puede entrar al panel todavía.
Este paso se hace **una sola vez**, manualmente:

1. En la app, entra a `/#admin` y pulsa "Iniciar sesión con Google" con la cuenta que va a ser
   administradora (idealmente la cuenta de la finca, ver README de la Fase 3 sobre transferir
   cuentas).
2. Te va a decir "Sin acceso todavía" — está bien, es lo esperado.
3. Ve a Firebase Console → Authentication → pestaña "Users" y copia el **UID** de esa cuenta.
4. Ve a Firestore Database → "Iniciar colección" → nombre `usuarios` → ID del documento: pega
   ese mismo UID → agrega los campos:
   - `nombre` (string): el nombre de la persona
   - `email` (string): su correo
   - `rol` (string): `admin`
5. Recarga la app y vuelve a entrar a `/#admin`: ya debería mostrar el panel completo.

Para dar de alta a un vendedor, el administrador repite el mismo procedimiento pero con
`rol: vendedor` — esos usuarios no ven Clientes bloqueados, Reportes ni Gastos.

## 4. Cargar las primeras especies

Con la sesión de administrador abierta, ve a **Panel interno → Inventario → + Nueva especie** y
registra las especies que maneja la finca (nombre, kilos iniciales, precio por kilo). Aparecerán
de inmediato en el catálogo del cliente.

## 5. Publicar (para que la finca lo use sin depender de ti)

```
npm install -g firebase-tools   # una sola vez en tu computador
firebase login
firebase init                    # elige Firestore + Hosting, selecciona tu proyecto
npm run build
firebase deploy
```

Al terminar te da una URL como `https://ayatech-alevinos.web.app` — esa es la dirección que usan
tanto los clientes como el personal de la finca.

### Transferir la propiedad a la finca

Antes de terminar el proyecto:

1. Crea una cuenta de Google propia de la finca (ej. `fincanuevavidaeldeseo@gmail.com`).
2. En Firebase Console → Configuración del proyecto → "Usuarios y permisos", agrega esa cuenta
   como **Propietario**.
3. Repite el paso 3 (crear administrador) con el UID de esa cuenta.
4. Retírate como colaborador cuando la finca confirme que ya puede entrar y administrar todo.

Desde ese momento, el proyecto, el hosting, la base de datos y el dominio quedan completamente
a nombre de la finca — no dependen de tu cuenta ni de tu computador.

## 6. Fotos de las especies (opcional)

En **Panel interno → Inventario**, cada especie tiene un botón "Agregar"/"Cambiar" foto. No sube
el archivo directamente: te lleva a [Cloudinary](https://cloudinary.com) (gratis, sin tarjeta),
donde subes la imagen y copias su enlace para pegarlo en el campo "URL de la foto". Esa misma
foto aparece automáticamente en el catálogo que ven los clientes. Mientras una especie no tenga
foto, se muestra un ícono de pez de respaldo.

## 7. Notificaciones por correo (opcional)

Si quieren que llegue un correo real al administrador por cada pedido nuevo (y al cliente cuando
se confirma o cancela el suyo), sigue las instrucciones de
[`notificaciones/README.md`](notificaciones/README.md) — toma un par de minutos, es gratis y no
requiere tarjeta. Mientras no lo configures, la app funciona exactamente igual, solo que sin
enviar esos correos.

## Estructura del proyecto

```
src/
├── firebase/config.ts        # conexión a Firebase + modo sin conexión
├── context/AuthContext.tsx   # sesión y rol del personal (Google Sign-In)
├── hooks/                    # lectura en tiempo real de Firestore
├── utils/                    # formato de dinero/kilos, fechas, enlace de WhatsApp
├── types/                    # tipos de datos (Especie, Pedido, Gasto, ...)
├── components/
│   ├── cliente/               # Catálogo, Formulario de pedido, Confirmación
│   └── admin/                 # Panel, Inventario, Pedidos, Historial, Bloqueados, Reportes, Gastos
└── pages/                    # ClienteApp.tsx y AdminApp.tsx (unen las piezas de arriba)
```

## Qué queda fuera de este prototipo (a propósito)

Siguiendo el alcance aprobado en la Fase 2/3 del proyecto académico, esta versión **no** incluye:
pagos en línea, facturación electrónica, ni envío 100% automático a WhatsApp (usa el botón
"Enviar por WhatsApp", que es gratis). Tampoco reemplaza la pesca, el pesaje, la entrega física
ni el cobro presencial — esas actividades siguen a cargo del personal de la finca.
