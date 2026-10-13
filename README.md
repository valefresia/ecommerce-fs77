# Patagonix Tech

E-commerce full-stack con catálogo de productos, carrito, checkout con pedidos y panel de administración. 
Proyecto integrador del módulo 5 de Henry.

**Demo:** https://ecommerce-fs77.vercel.app/

## Funcionalidades

- **Autenticación** con email y contraseña y con Google (Firebase Auth).
- **Roles** `customer` y `admin`, con rutas protegidas (`ProtectedRoute`, `AdminRoute`).
- **Catálogo** con filtro por categoría y detalle de cada producto.
- **Carrito** con Context API + `useReducer`, persistido en `localStorage` y limitado por stock.
- **Checkout** con transacción en Firestore: valida stock, descuenta y crea el pedido en un solo paso.
- **Mis pedidos** para el cliente.
- **Panel admin**: CRUD de productos, subida de imágenes y gestión de pedidos (cambio de estado; al cancelar se devuelve el stock).
- **Subida de imágenes** a Cloudinary con firma generada en una Vercel Function.
- **Tests** con Vitest y React Testing Library.

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

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) en `localhost:5173` |
| `npm run build` | Chequeo de tipos y build de producción |
| `npm test` | Corre los tests una vez |
| `npm run test:watch` | Tests en modo observador |
| `npm run lint` | ESLint |

Vite **no ejecuta** la carpeta `api/`. Para probar la subida de imágenes en local se usa `npx vercel dev` (queda en `localhost:3000`) o se prueba directamente en el deploy.

## Variables de entorno

Copiá `.env.example` a `.env` y completá:

| Variable | Dónde se usa |
|---|---|
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` |
 Front (config de Firebase). La función serverless también usa
  `API_KEY` y `PROJECT_ID` para verificar al admin |

| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |

 **Solo servidor** (Vercel Function). Sin prefijo `VITE_`, así nunca llegan al navegador |

En Vercel se cargan en *Project > Settings > Environment Variables*. Después de cambiarlas hay que redeployar.

## Estructura
```
api/
  upload-signature.ts      # Vercel Function: verifica admin y firma la subida a Cloudinary
src/
  components/              # FormInput, ErrorMessage, Spinner, ProductCard, ProductForm, AdminOrders
  contexts/                # AuthContext, CartContext
  hooks/                   # useAuth, useCart, useProducts, useProduct
  pages/                   # Home, Login, Register, ProductDetail, Cart, Checkout, Orders, AdminDashboard
  reducers/                # cartReducer (lógica pura del carrito)
  router/                  # AppRouter, ProtectedRoute, AdminRoute
  services/                # firebase, authService, productService, orderService, uploadService
  types/                   # tipos compartidos (UserProfile, Product, Order, ...)
  utils/                   # validators, productValidators, authErrors
  test/                    # setup de Testing Library
```
Los componentes nunca hablan con Firebase directamente: todo pasa por `services/`.

## Modelo de datos (Firestore)

- `users/{uid}`: `uid`, `email`, `displayName`, `role` (`customer` | `admin`), `createdAt`.
- `products/{id}`: `name`, `description`, `price`, `category`, `imageUrl`, `stock`, `createdAt`.
- `orders/{id}`: `userId`, `items[]` (`productId`, `name`, `price`, `quantity`), `total`, `status`, `createdAt`.

## Seguridad

Reglas de Firestore:

- Cada usuario lee y edita solo su perfil y no puede cambiarse el rol. Los admins se asignan a mano desde la consola.
- `products` es de lectura pública; solo el admin crea, edita y borra. Un cliente autenticado únicamente puede bajar el stock (la compra).
- `orders`: el cliente crea y lee los suyos; el admin lee todos y cambia el estado.

Subida de imágenes: el navegador pide una firma a `/api/upload-signature`, la función valida el token de Firebase y que el rol sea `admin`, y recién ahí firma. El `API_SECRET` de Cloudinary nunca sale del servidor.

## Decisiones técnicas

- **Transacciones** en el checkout y en la cancelación de pedidos, para que stock y pedido no queden inconsistentes.
- **Precios desde la base**: al confirmar, el pedido toma nombre y precio de Firestore, no del carrito.
- **Cloudinary en lugar de S3**: la consigna pedía S3 con presigned URLs; se acordó con el equipo docente reemplazarlo por Cloudinary manteniendo la misma arquitectura (función serverless que protege las credenciales).

## Limitaciones conocidas

- El carrito vive en el navegador, no en la cuenta del usuario.
- El descuento de stock lo hace el cliente dentro de una transacción; en un sistema real lo haría un backend con privilegios.
- El pago está simulado: el pedido se crea en estado "Pendiente".

## Uso de la ia
- https://drive.google.com/drive/folders/1kZESx_qCTHDatftRnkMD8G75gbiRU40A?usp=drive_link

## Autora
Valentina Fresia · [GitHub: valefresia](https://github.com/valefresia)