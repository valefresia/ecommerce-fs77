import { auth } from './firebase';

interface SignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

// 1) Pide la firma a nuestra función  2) sube la imagen directo a Cloudinary
export async function uploadProductImage(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay sesión iniciada');
  const idToken = await user.getIdToken();

  const sigRes = await fetch('/api/upload-signature', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!sigRes.ok) throw new Error('No se pudo obtener la firma de subida');
  const { cloudName, apiKey, timestamp, folder, signature } =
    (await sigRes.json()) as SignatureResponse;

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!upRes.ok) throw new Error('Falló la subida a Cloudinary');

  const data = (await upRes.json()) as { secure_url: string };
  return data.secure_url;
}