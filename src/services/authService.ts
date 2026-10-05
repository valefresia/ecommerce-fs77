import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import type { UserProfile } from '../types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

// Crea el perfil solo si no existe. La transacción evita que dos
// llamadas simultáneas (context + registro) se pisen entre sí.
export async function ensureUserProfile(user: User, displayName?: string): Promise<UserProfile> {
  const ref = doc(db, 'users', user.uid);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) return snap.data() as UserProfile;

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email ?? '',
      displayName: displayName ?? user.displayName ?? user.email?.split('@')[0] ?? '',
      role: 'customer',
      createdAt: Date.now(),
    };
    tx.set(ref, profile);
    return profile;
  });
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  // merge: si el context ya creó el doc, acá se corrige el nombre real
  await setDoc(
    doc(db, 'users', cred.user.uid),
    {
      uid: cred.user.uid,
      email,
      displayName,
      role: 'customer',
      createdAt: Date.now(),
    },
    { merge: true },
  );
}

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);