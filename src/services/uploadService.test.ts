import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadProductImage } from './uploadService';

// Mock de Firebase Auth: un usuario con un token de prueba
const mockAuth = vi.hoisted(() => ({
  currentUser: { getIdToken: () => Promise.resolve('token-de-prueba') } as {
    getIdToken: () => Promise<string>;
  } | null,
}));
vi.mock('./firebase', () => ({ auth: mockAuth }));

const file = new File(['contenido'], 'foto.png', { type: 'image/png' });

const signature = {
  cloudName: 'demo',
  apiKey: 'clave-publica',
  timestamp: 1234567890,
  folder: 'products',
  signature: 'firma-de-prueba',
};
const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/products/foto.png';

const okResponse = (data: unknown) => ({ ok: true, json: async () => data });
const failedResponse = { ok: false, json: async () => ({}) };

beforeEach(() => {
  mockAuth.currentUser = { getIdToken: () => Promise.resolve('token-de-prueba') };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('uploadProductImage', () => {
  it('pide la firma con el token y sube la imagen a Cloudinary', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse(signature))
      .mockResolvedValueOnce(okResponse({ secure_url: cloudinaryUrl }));
    vi.stubGlobal('fetch', fetchMock);

    const url = await uploadProductImage(file);

    expect(url).toBe(cloudinaryUrl);

    // 1) Pidió la firma a nuestra función serverless, con la sesión del usuario
    const [signatureUrl, signatureInit] = fetchMock.mock.calls[0];
    expect(signatureUrl).toBe('/api/upload-signature');
    expect(signatureInit.method).toBe('POST');
    expect(signatureInit.headers.Authorization).toBe('Bearer token-de-prueba');

    // 2) Subió directo a Cloudinary con la firma recibida
    const [uploadUrl, uploadInit] = fetchMock.mock.calls[1];
    expect(uploadUrl).toBe('https://api.cloudinary.com/v1_1/demo/image/upload');
    const body = uploadInit.body as FormData;
    expect(body.get('signature')).toBe('firma-de-prueba');
    expect(body.get('api_key')).toBe('clave-publica');
    expect(body.get('timestamp')).toBe('1234567890');
    expect(body.get('folder')).toBe('products');
    expect(body.get('file')).toBeInstanceOf(File);

    // El secreto nunca viaja desde el navegador
    expect(body.has('api_secret')).toBe(false);
  });

  it('falla si no hay sesión y no llama a la red', async () => {
    mockAuth.currentUser = null;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(uploadProductImage(file)).rejects.toThrow('No hay sesión iniciada');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('falla si la función no entrega la firma (por ejemplo, no es admin)', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(failedResponse);
    vi.stubGlobal('fetch', fetchMock);

    await expect(uploadProductImage(file)).rejects.toThrow('No se pudo obtener la firma de subida');
    expect(fetchMock).toHaveBeenCalledTimes(1); // no intentó subir nada
  });

  it('falla si Cloudinary rechaza la subida', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okResponse(signature))
      .mockResolvedValueOnce(failedResponse);
    vi.stubGlobal('fetch', fetchMock);

    await expect(uploadProductImage(file)).rejects.toThrow('Falló la subida a Cloudinary');
  });
});