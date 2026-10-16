import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AppRouter from "../router/AppRouter";
import {
  createOrder,
  getOrdersByUser,
  OrderError,
} from "../services/orderService";
import { makeProduct, makeProfile, makeUser } from "../test/factories";
import { renderWithProviders } from "../test/renderWithProviders";

// Se mockean los servicios que tocan Firestore. El pago simulado corre real (tarda 1,5 s).
vi.mock("../services/productService", () => ({
  getProducts: vi.fn(),
  getProductsFiltered: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));
vi.mock("../services/orderService", () => ({
  createOrder: vi.fn(),
  getOrdersByUser: vi.fn(),
  getAllOrders: vi.fn(),
  getOrderById: vi.fn(),
  updateOrderStatus: vi.fn(),
  OrderError: class OrderError extends Error {},
}));

// Es la clave que usa CartContext para guardar el carrito en localStorage
const CART_KEY = "ecommerce-fs77-cart";

const product = makeProduct({
  id: "p1",
  name: "iPhone 17 256 GB",
  price: 1000,
  stock: 5,
});
const loggedIn = { user: makeUser("u1"), profile: makeProfile({ uid: "u1" }) };

const input = (name: string) =>
  document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;

async function fillCard(
  user: ReturnType<typeof userEvent.setup>,
  number: string,
) {
  await user.type(input("holder"), "Valentina Fresia");
  await user.type(input("number"), number);
  await user.type(input("expiry"), "1240"); // se formatea solo como 12/40
  await user.type(input("cvc"), "123");
}

const payButton = () => screen.getByRole("button", { name: /^Pagar/ });
const savedCart = () => JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getOrdersByUser).mockResolvedValue([]);
  // Carrito con 2 unidades, como si  las hubiera agregado
  localStorage.setItem(CART_KEY, JSON.stringify([{ product, quantity: 2 }]));
});

describe("Checkout: acceso", () => {
  it("manda al login a quien no tiene sesión", async () => {
    renderWithProviders(<AppRouter />, { route: "/checkout" });
    expect(
      await screen.findByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });

  it("manda al carrito si está vacío", async () => {
    localStorage.setItem(CART_KEY, "[]");
    renderWithProviders(<AppRouter />, { route: "/checkout", auth: loggedIn });
    expect(
      await screen.findByRole("heading", { name: "Mi carrito" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explorar catálogo" }),
    ).toHaveAttribute("href", "/");
  });
});

describe("Checkout: pago y creación de la orden", () => {
  it("no cobra ni crea la orden si el formulario está vacío", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, { route: "/checkout", auth: loggedIn });
    await screen.findByRole("heading", { name: "Confirmar compra" });

    await user.click(payButton());

    expect(
      await screen.findByText("El número debe tener 16 dígitos."),
    ).toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("con tarjeta aprobada crea la orden, vacía el carrito y lleva a Mis pedidos", async () => {
    vi.mocked(createOrder).mockResolvedValue("order-1");
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, { route: "/checkout", auth: loggedIn });
    await screen.findByRole("heading", { name: "Confirmar compra" });

    await fillCard(user, "4242424242424242");
    await user.click(payButton());

    expect(
      await screen.findByRole(
        "heading",
        { name: "Mis pedidos" },
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();

    // La orden se creó para el usuario correspondiente, con los items del carrito y solo los últimos 4 dígitos
    expect(createOrder).toHaveBeenCalledWith(
      "u1",
      [
        expect.objectContaining({
          quantity: 2,
          product: expect.objectContaining({ id: "p1" }),
        }),
      ],
      { method: "simulated-card", last4: "4242" },
    );
    expect(savedCart()).toEqual([]);
  }, 10_000);

  it("con tarjeta rechazada muestra el error y no crea la orden", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, { route: "/checkout", auth: loggedIn });
    await screen.findByRole("heading", { name: "Confirmar compra" });

    await fillCard(user, "4000000000000002");
    await user.click(payButton());

    expect(
      await screen.findByText(
        "La tarjeta fue rechazada. Probá con otra.",
        {},
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
    expect(savedCart()).toHaveLength(1); // el carrito sigue intacto
  }, 10_000);

  it("muestra el error del servicio (por ejemplo, sin stock) y conserva el carrito", async () => {
    const message = 'No hay stock suficiente de "iPhone 17 256 GB" (quedan 1).';
    vi.mocked(createOrder).mockRejectedValue(new OrderError(message));
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, { route: "/checkout", auth: loggedIn });
    await screen.findByRole("heading", { name: "Confirmar compra" });

    await fillCard(user, "4242424242424242");
    await user.click(payButton());

    expect(
      await screen.findByText(message, {}, { timeout: 4000 }),
    ).toBeInTheDocument();
    expect(savedCart()).toHaveLength(1);
    await waitFor(() => expect(payButton()).toBeEnabled());
  }, 10_000);
});
