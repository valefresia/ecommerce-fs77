import { createProduct, getProducts } from './productService';
import { seedProducts } from '../data/seedProducts';

// Devuelve cuántos productos nuevos se cargaron
export async function seedSampleProducts(): Promise<number> {
  const existing = new Set((await getProducts()).map((p) => p.name));
  const toCreate = seedProducts.filter((p) => !existing.has(p.name));

  // Uno por uno, así cada producto queda con su propio createdAt
  for (const product of toCreate) {
    await createProduct(product);
  }
  return toCreate.length;
}