# Patagonix Tech

E-commerce full-stack con catálogo de productos, carrito, checkout con pedidos y panel de administración.
Proyecto integrador del módulo 5 de Henry.

**Demo:** https://ecommerce-fs77.vercel.app/

## Funcionalidades

- **Autenticación** con email y contraseña y con Google (Firebase Auth).
- **Roles** `customer` y `admin`, con rutas protegidas (`ProtectedRoute`, `AdminRoute`).
- **Catálogo** con búsqueda por nombre (sin distinguir tildes), filtro por categoría, orden y detalle de producto.
- **Carrito** con Context API + `useReducer`, persistido en `localStorage` y limitado por stock.
- **Checkout** con formulario de tarjeta y pago simulado; si se aprueba, una transacción de Firestore valida el stock, lo descuenta y crea el pedido.
- **Mis pedidos** con estado y pantalla de detalle para cada pedido.
- **Panel admin** (`/admin`): CRUD de productos, subida de imágenes y gestión de pedidos en `/admin/orders` (al cancelar se devuelve el stock).
- **Subida de imágenes** a Cloudinary con firma generada en una Vercel Function.
- **Tests** con Vitest y React Testing Library; se pueden ejecutar con cobertura usando `npx vitest run --coverage`.

## Stack

React 18 · TypeScript · Vite · React Router · Tailwind CSS · Firebase (Auth y Firestore) · Cloudinary · Vercel (hosting y Serverless Functions) · Vitest + Testing Library

## Cómo correrlo

```bash
git clone https://github.com/valefresia/ecommerce-fs77.git
cd ecommerce-fs77
npm install
cp .env.example .env
npm run dev
```

Scripts disponibles:

| Comando                     | Qué hace                                          |
| --------------------------- | ------------------------------------------------- |
| `npm run dev`               | Servidor de desarrollo (Vite) en `localhost:5173` |
| `npm run build`             | Chequeo de tipos y build de producción            |
| `npm test`                  | Corre los tests una vez                           |
| `npm run test:watch`        | Tests en modo observador                          |
| `npx vitest run --coverage` | Corre los tests y genera el reporte de cobertura  |
| `npm run lint`              | ESLint                                            |

Vite **no ejecuta** la carpeta `api/`. Para probar la subida de imágenes en local se usa `npx vercel dev` (queda en `localhost:3000`) o se prueba directamente en el deploy.

## Variables de entorno

Copiá `.env.example` a `.env` y completá:

| Variable                                                                                                                                                                      | Dónde se usa                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Configuración del SDK de Firebase en el frontend. La función también usa la API key y el project ID para verificar la sesión. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`                                                                                                                                 | La función devuelve estos identificadores al navegador para subir la imagen firmada. La API key no es el secreto.             |
| `CLOUDINARY_API_SECRET`                                                                                                                                                       | Solo servidor: la Vercel Function lo usa para firmar la subida; no se envía al navegador.                                     |

En Vercel se cargan en _Project > Settings > Environment Variables_. Después de cambiarlas hay que redeployar.

## Estructura

```
api/
  upload-signature.ts      # Vercel Function: verifica admin y firma la subida a Cloudinary
src/
  components/              # UI compartida: formularios, tarjetas, navegación y administración
  contexts/                # AuthContext, CartContext
  data/                    # Productos usados para la carga opcional de ejemplo
  hooks/                   # useAuth, useCart, useDebounce, useOrder, useProduct
  pages/                   # Catálogo, cuenta, productos, carrito, checkout, pedidos y vistas admin
  reducers/                # cartReducer (lógica pura del carrito)
  router/                  # AppRouter, ProtectedRoute, AdminRoute y tests de rutas
  services/                # Firebase, auth, productos, pedidos, pago simulado y subida de imágenes
  types/                   # tipos compartidos (UserProfile, Product, Order, ...)
  utils/                   # validadores y formatos compartidos
  test/                    # setup, datos de prueba y helpers para renderizar con providers
  index.css                # estilos globales y responsive
public/
  patagonix-favicon.svg    # favicon de la marca
```

Las vistas delegan las operaciones de negocio en `services/`; `AuthProvider` escucha los cambios de Firebase Auth y `CartProvider` centraliza el estado del carrito.
`SiteChrome` monta la navegación y el footer compartidos desde `App`; `Home` también conserva un encabezado propio.

## Modelo de datos (Firestore)

- `users/{uid}`: `uid`, `email`, `displayName`, `role` (`customer` | `admin`), `createdAt`.
- `products/{id}`: `name`, `description`, `price`, `category`, `imageUrl`, `stock`, `createdAt`.
- `orders/{id}`: `userId`, `items[]` (`productId`, `name`, `price`, `quantity`), `total`, `status`, `createdAt` y `payment` opcional (`method`, `last4`). Nunca se guarda el número completo ni el CVC.

## Seguridad

El repositorio no contiene un archivo de reglas de Firestore: los permisos efectivos deben revisarse en la consola del proyecto Firebase. La configuración documentada para la aplicación es:

- Cada usuario lee y edita solo su perfil y no puede cambiarse el rol. Los admins se asignan a mano desde la consola.
- `products` es de lectura pública; solo el admin crea, edita y borra. Un cliente autenticado únicamente puede bajar el stock (la compra).
- `orders`: el cliente crea y lee los suyos; el admin lee todos y cambia el estado.

Las rutas protegidas del frontend controlan la navegación, pero no reemplazan las reglas de Firestore. La subida de imágenes sí pide una firma a `/api/upload-signature`; la función valida el token de Firebase y el rol `admin` antes de firmar. `CLOUDINARY_API_SECRET` nunca sale del servidor.

## Decisiones técnicas

- **Transacciones** en el checkout y en la cancelación de pedidos, para que stock y pedido no queden inconsistentes.
- **Precios desde la base**: al confirmar, el pedido toma nombre y precio de Firestore, no del carrito.
- **Pago simulado**: no se conecta con una pasarela ni procesa dinero real; solo valida el formulario, simula aprobación/rechazo y registra método y últimos cuatro dígitos.
- **Cloudinary en lugar de S3**: la consigna pedía S3 con presigned URLs; se acordó con el equipo docente reemplazarlo por Cloudinary manteniendo la misma arquitectura (función serverless que protege las credenciales).

## Limitaciones conocidas

- El carrito vive en el navegador, no en la cuenta del usuario.
- El descuento de stock lo hace el cliente dentro de una transacción; en un sistema real lo haría un backend con privilegios.
- Los roles de administrador se asignan manualmente; el registro público crea perfiles `customer`.
- El pago es simulado y los pedidos aprobados se crean en estado `pending`.

## Uso de la ia

- https://drive.google.com/drive/folders/1kZESx_qCTHDatftRnkMD8G75gbiRU40A?usp=drive_link

## Autora

Valentina Fresia · [GitHub: valefresia](https://github.com/valefresia)
