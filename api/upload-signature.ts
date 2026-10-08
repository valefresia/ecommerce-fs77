import { createHash } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Valida el token con Firebase y revisa en Firestore que el rol sea admin
async function verifyAdmin(idToken: string): Promise<boolean> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) throw new Error('Faltan las variables de Firebase');

  // 1) Firebase valida el token y nos dice de quién es
  const lookup = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );
  if (!lookup.ok) return false;
  const { users } = (await lookup.json()) as { users?: { localId: string }[] };
  const uid = users?.[0]?.localId;
  if (!uid) return false;

  // 2) Leemos su perfil con SU propio token, así aplican las reglas de Firestore
  const profile = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
  if (!profile.ok) return false;
  const data = (await profile.json()) as { fields?: { role?: { stringValue?: string } } };
  return data.fields?.role?.stringValue === 'admin';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const idToken = req.headers.authorization?.replace('Bearer ', '');
  if (!idToken) return res.status(401).json({ error: 'Falta el token de sesión' });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Faltan las variables de Cloudinary' });
  }

  try {
    if (!(await verifyAdmin(idToken))) {
      return res.status(403).json({ error: 'Solo los admins pueden subir imágenes' });
    }

    // Cloudinary firma los parámetros ordenados alfabéticamente + el secret (SHA-1)
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'products';
    const signature = createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    // El secret NUNCA sale de acá: el front recibe solo la firma
    return res.status(200).json({ cloudName, apiKey, timestamp, folder, signature });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'No se pudo generar la firma' });
  }
}