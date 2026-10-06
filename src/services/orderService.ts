import { collection, doc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { db } from './firebase';
import type { CartItem, Order, OrderItem, Product } from '../types';

// Errores que le podemos mostrar tal cual al usuario (sin stock, producto borrado)
export class OrderError extends Error {}

export async function createOrder(userId: string, cartItems: CartItem[]): Promise<string> {
  const orderRef = doc(collection(db, 'orders'));

  await runTransaction(db, async (tx) => {
    const productRefs = cartItems.map(({ product }) => doc(db, 'products', product.id));

    // En una transacción, primero se leen todos los documentos y recién después se escribe
    const snaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

    const items: OrderItem[] = [];
    const newStocks: number[] = [];

    snaps.forEach((snap, i) => {
      const { product, quantity } = cartItems[i];
      if (!snap.exists()) {
        throw new OrderError(`"${product.name}" ya no está disponible.`);
      }
      const data = snap.data() as Omit<Product, 'id'>;
      if (data.stock < quantity) {
        throw new OrderError(
          `No hay stock suficiente de "${data.name}" (quedan ${data.stock}).`,
        );
      }
      items.push({ productId: snap.id, name: data.name, price: data.price, quantity });
      newStocks.push(data.stock - quantity);
    });

    productRefs.forEach((ref, i) => tx.update(ref, { stock: newStocks[i] }));

    const order: Omit<Order, 'id'> = {
      userId,
      items,
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      status: 'pending',
      createdAt: Date.now(),
    };
    tx.set(orderRef, order);
  });

  return orderRef.id;
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const snap = await getDocs(query(collection(db, 'orders'), where('userId', '==', userId)));
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }))
    .sort((a, b) => b.createdAt - a.createdAt); // ordenamos acá para no necesitar un índice en Firestore
}