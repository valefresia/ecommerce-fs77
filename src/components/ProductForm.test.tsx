import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadProductImage } from '../services/uploadService';
import ProductForm from './ProductForm';

vi.mock('../services/uploadService', () => ({ uploadProductImage: vi.fn() }));

const url = 'https://res.cloudinary.com/demo/image/upload/products/foto.png';
const image = new File(['x'], 'foto.png', { type: 'image/png' });

const input = (name: string) =>
  document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;

beforeEach(() => {
  vi.resetAllMocks();
  // El componente registra los errores en consola: se silencia para no ensuciar la salida
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ProductForm', () => {
  it('muestra errores y no envía si faltan datos', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ProductForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sube la imagen, muestra la vista previa y envía el producto con la URL', async () => {
    vi.mocked(uploadProductImage).mockResolvedValue(url);
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ProductForm onSubmit={onSubmit} />);

    await user.upload(screen.getByLabelText(/Imagen \(opcional\)/), image);

    expect(await screen.findByAltText('Vista previa')).toHaveAttribute('src', url);
    expect(uploadProductImage).toHaveBeenCalledWith(image);
    expect(input('imageUrl')).toHaveValue(url);

    await user.type(input('name'), 'Motorola Moto E15 64 GB');
    await user.type(screen.getByLabelText('Descripción'), 'Lo esencial al menor precio');
    await user.type(input('price'), '159999');
    await user.type(input('stock'), '30');
    await user.type(input('category'), 'Motorola');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Motorola Moto E15 64 GB',
      description: 'Lo esencial al menor precio',
      price: 159999,
      category: 'Motorola',
      imageUrl: url,
      stock: 30,
    });
  });

  it('avisa si la subida falla', async () => {
    vi.mocked(uploadProductImage).mockRejectedValue(new Error('falló'));
    const user = userEvent.setup();
    render(<ProductForm onSubmit={vi.fn()} />);

    await user.upload(screen.getByLabelText(/Imagen \(opcional\)/), image);

    expect(
      await screen.findByText('No se pudo subir la imagen. Intentá de nuevo.'),
    ).toBeInTheDocument();
  });

  it('rechaza archivos que no son imágenes sin llamar al servicio', async () => {
    // applyAccept: false simula un archivo que se cuela por el selector del navegador
    const user = userEvent.setup({ applyAccept: false });
    render(<ProductForm onSubmit={vi.fn()} />);

    await user.upload(
      screen.getByLabelText(/Imagen \(opcional\)/),
      new File(['texto'], 'notas.txt', { type: 'text/plain' }),
    );

    expect(await screen.findByText('El archivo tiene que ser una imagen.')).toBeInTheDocument();
    expect(uploadProductImage).not.toHaveBeenCalled();
  });

  it('rechaza imágenes de más de 5 MB', async () => {
    const user = userEvent.setup();
    render(<ProductForm onSubmit={vi.fn()} />);

    await user.upload(
      screen.getByLabelText(/Imagen \(opcional\)/),
      new File([new Uint8Array(6 * 1024 * 1024)], 'grande.png', { type: 'image/png' }),
    );

    expect(await screen.findByText('La imagen no puede pesar más de 5 MB.')).toBeInTheDocument();
    expect(uploadProductImage).not.toHaveBeenCalled();
  });
});