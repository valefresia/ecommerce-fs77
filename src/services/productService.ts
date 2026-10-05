import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from '../types';

const productsRef = collection(db, 'products');

// Lo que el admin completa en el formulario (el id y la fecha los pone el servicio)
export type ProductInput = Omit<Product, 'id' | 'createdAt'>;

export async function getProducts(): Promise<Product[]> {
  const q = query(productsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Product, 'id'>) } : null;
}

export async function createProduct(input: ProductInput): Promise<string> {
  const ref = await addDoc(productsRef, { ...input, createdAt: Date.now() });
  return ref.id;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  await updateDoc(doc(db, 'products', id), input);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}