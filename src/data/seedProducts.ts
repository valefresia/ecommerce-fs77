import type { ProductInput } from '../services/productService';

// Catálogo de ejemplo de Patagonix Tech. La categoría es la marca.
// Los precios son aproximados y sirven para la demo.
// Las imágenes se suben después desde el panel admin (Editar).
export const seedProducts: ProductInput[] = [
  // ---------- iPhone ----------
  {
    name: 'iPhone 17 Pro Max 256 GB',
    description:
      'Pantalla de 6,9 pulgadas, cámaras de nivel profesional y batería de larga duración. La gama más alta de Apple.',
    price: 3399000,
    category: 'iPhone',
    imageUrl: '',
    stock: 3,
  },
  {
    name: 'iPhone 17 Pro 256 GB',
    description:
      'La gama Pro de Apple: cámaras avanzadas, gran rendimiento y 256 GB de almacenamiento.',
    price: 2899999,
    category: 'iPhone',
    imageUrl: '',
    stock: 5,
  },
  {
    name: 'iPhone Air 256 GB',
    description:
      'El iPhone más delgado y liviano de la línea, con diseño cuidado y 256 GB de almacenamiento.',
    price: 2699999,
    category: 'iPhone',
    imageUrl: '',
    stock: 6,
  },
  {
    name: 'iPhone 16 Pro 256 GB',
    description:
      'Gama Pro de la generación anterior, con cámaras avanzadas y 256 GB de almacenamiento.',
    price: 2499999,
    category: 'iPhone',
    imageUrl: '',
    stock: 4,
  },
  {
    name: 'iPhone 17 256 GB',
    description:
      'El iPhone equilibrado: rendimiento de última generación, buena cámara y 256 GB de almacenamiento.',
    price: 2089999,
    category: 'iPhone',
    imageUrl: '',
    stock: 8,
  },
  {
    name: 'iPhone 17e 128 GB',
    description:
      'La puerta de entrada a la última generación de iPhone, con 128 GB de almacenamiento.',
    price: 1699999,
    category: 'iPhone',
    imageUrl: '',
    stock: 12,
  },
  {
    name: 'iPhone 16 128 GB',
    description:
      'Una opción más accesible para entrar al ecosistema Apple, con el chip A18 y 128 GB de almacenamiento.',
    price: 1599999,
    category: 'iPhone',
    imageUrl: '',
    stock: 10,
  },
  {
    name: 'iPhone 15 128 GB',
    description:
      'Un clásico de la generación anterior, con 128 GB y todo el ecosistema de Apple.',
    price: 1399999,
    category: 'iPhone',
    imageUrl: '',
    stock: 9,
  },
  {
    name: 'iPhone 16e 128 GB',
    description:
      'El iPhone más accesible de la línea 16, con 128 GB de almacenamiento.',
    price: 1299999,
    category: 'iPhone',
    imageUrl: '',
    stock: 11,
  },

  // ---------- Samsung ----------
  {
    name: 'Samsung Galaxy S26 Ultra 256 GB',
    description:
      'El tope de gama de Samsung: pantalla de primer nivel, cámaras versátiles y 256 GB de almacenamiento.',
    price: 3399999,
    category: 'Samsung',
    imageUrl: '',
    stock: 4,
  },
  {
    name: 'Samsung Galaxy S25 Ultra 256 GB',
    description:
      'Gama Ultra de la generación anterior: pantalla grande, cámaras potentes y 256 GB.',
    price: 2999999,
    category: 'Samsung',
    imageUrl: '',
    stock: 5,
  },
  {
    name: 'Samsung Galaxy S26 256 GB',
    description:
      'El Galaxy S de la nueva generación en formato más compacto, con 256 GB de almacenamiento.',
    price: 2399999,
    category: 'Samsung',
    imageUrl: '',
    stock: 7,
  },
  {
    name: 'Samsung Galaxy S25 FE 256 GB',
    description:
      'Gama alta a un precio más contenido, con 256 GB y la experiencia completa del ecosistema Galaxy.',
    price: 1590000,
    category: 'Samsung',
    imageUrl: '',
    stock: 9,
  },
  {
    name: 'Samsung Galaxy S24 FE 256 GB',
    description:
      'Rendimiento de gama alta en la versión Fan Edition, con 256 GB de almacenamiento.',
    price: 1299999,
    category: 'Samsung',
    imageUrl: '',
    stock: 8,
  },
  {
    name: 'Samsung Galaxy A56 5G 256 GB',
    description:
      'Gama media con conectividad 5G, 8 GB de RAM y 256 GB para guardar todo.',
    price: 699999,
    category: 'Samsung',
    imageUrl: '',
    stock: 14,
  },
  {
    name: 'Samsung Galaxy A26 5G 256 GB',
    description:
      'Conectividad 5G y mucho almacenamiento en un equipo de gama media accesible.',
    price: 599999,
    category: 'Samsung',
    imageUrl: '',
    stock: 15,
  },
  {
    name: 'Samsung Galaxy A36 5G 256 GB',
    description:
      'Un equilibrio entre precio y prestaciones, con 5G, 8 GB de RAM y 256 GB.',
    price: 549999,
    category: 'Samsung',
    imageUrl: '',
    stock: 16,
  },
  {
    name: 'Samsung Galaxy A16 128 GB',
    description:
      'Pantalla AMOLED y respaldo de marca en un equipo accesible, ideal para el uso de todos los días.',
    price: 289999,
    category: 'Samsung',
    imageUrl: '',
    stock: 25,
  },
  {
    name: 'Samsung Galaxy A15 128 GB',
    description:
      'Uno de los Galaxy más buscados, con 128 GB y triple cámara trasera para el uso diario.',
    price: 249999,
    category: 'Samsung',
    imageUrl: '',
    stock: 22,
  },
  {
    name: 'Samsung Galaxy A06 128 GB',
    description:
      'Samsung en su versión más accesible, con 128 GB y 4 GB de RAM para el uso diario.',
    price: 199999,
    category: 'Samsung',
    imageUrl: '',
    stock: 28,
  },

  // ---------- Xiaomi ----------
  {
    name: 'Xiaomi 14T 256 GB',
    description:
      'La gama alta accesible de Xiaomi, con 256 GB de almacenamiento y foco en la cámara.',
    price: 899999,
    category: 'Xiaomi',
    imageUrl: '',
    stock: 6,
  },
  {
    name: 'Xiaomi Redmi Note 15 Pro 256 GB',
    description:
      'La línea Note de Xiaomi, pensada para quien busca más cámara y rendimiento sin irse de precio.',
    price: 579999,
    category: 'Xiaomi',
    imageUrl: '',
    stock: 12,
  },
  {
    name: 'Xiaomi Redmi Note 14 Pro 256 GB',
    description:
      'Una Note con buena cámara y 256 GB de almacenamiento, de las más elegidas de la marca.',
    price: 479999,
    category: 'Xiaomi',
    imageUrl: '',
    stock: 10,
  },
  {
    name: 'Xiaomi Redmi Note 14 128 GB',
    description:
      'Equilibrio entre pantalla, batería y precio dentro de la línea Note.',
    price: 349999,
    category: 'Xiaomi',
    imageUrl: '',
    stock: 14,
  },
  {
    name: 'Xiaomi Redmi 15C 128 GB',
    description:
      'Pantalla grande y batería de larga duración, con 4 GB de RAM y 128 GB de almacenamiento.',
    price: 249999,
    category: 'Xiaomi',
    imageUrl: '',
    stock: 20,
  },
  {
    name: 'Xiaomi Redmi 13 256 GB',
    description:
      'Mucho almacenamiento a un precio contenido, ideal para fotos, apps y música.',
    price: 229999,
    category: 'Xiaomi',
    imageUrl: '',
    stock: 20,
  },
  {
    name: 'Xiaomi Redmi 14C 128 GB',
    description:
      'Una de las opciones más elegidas de Xiaomi por su relación entre precio y prestaciones.',
    price: 219999,
    category: 'Xiaomi',
    imageUrl: '',
    stock: 15,
  },
  {
    name: 'Xiaomi Redmi 13C 128 GB',
    description:
      'Un Redmi de entrada con 128 GB de almacenamiento para el uso de todos los días.',
    price: 199999,
    category: 'Xiaomi',
    imageUrl: '',
    stock: 18,
  },

  // ---------- Motorola ----------
  {
    name: 'Motorola Edge 50 Fusion 256 GB',
    description:
      'La línea Edge de Motorola: diseño cuidado, buena pantalla y 256 GB de almacenamiento.',
    price: 649999,
    category: 'Motorola',
    imageUrl: '',
    stock: 8,
  },
  {
    name: 'Motorola Moto G85 5G 256 GB',
    description:
      'Conectividad 5G y 256 GB de almacenamiento en un Moto de gama media.',
    price: 549999,
    category: 'Motorola',
    imageUrl: '',
    stock: 12,
  },
  {
    name: 'Motorola Moto G55 5G 256 GB',
    description:
      'Un Moto 5G con mucho espacio para guardar fotos, apps y videos.',
    price: 399999,
    category: 'Motorola',
    imageUrl: '',
    stock: 14,
  },
  {
    name: 'Motorola Moto G35 5G 128 GB',
    description:
      'Conectividad 5G a un precio accesible, con 128 GB de almacenamiento.',
    price: 299999,
    category: 'Motorola',
    imageUrl: '',
    stock: 16,
  },
  {
    name: 'Motorola Moto G15 256 GB',
    description:
      'Pantalla de 6,72 pulgadas y 256 GB de almacenamiento, una de las líneas más populares de Motorola.',
    price: 259999,
    category: 'Motorola',
    imageUrl: '',
    stock: 18,
  },
  {
    name: 'Motorola Moto G05 64 GB',
    description:
      'Un Moto de entrada con lo necesario para el día a día: pantalla grande y batería para toda la jornada.',
    price: 179999,
    category: 'Motorola',
    imageUrl: '',
    stock: 22,
  },
  {
    name: 'Motorola Moto E15 64 GB',
    description:
      'Lo esencial al menor precio: buena pantalla y batería para quien busca un equipo básico.',
    price: 159999,
    category: 'Motorola',
    imageUrl: '',
    stock: 30,
  },
  {
    name: 'Motorola Moto E14 64 GB',
    description:
      'Básico y confiable, con 64 GB de almacenamiento para quien quiere lo esencial.',
    price: 149999,
    category: 'Motorola',
    imageUrl: '',
    stock: 26,
  },
];