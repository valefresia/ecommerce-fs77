import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";
import { getProducts, getProductsFiltered } from "../services/productService";
import { makeProduct } from "../test/factories";
import { renderWithProviders } from "../test/renderWithProviders";

vi.mock("../services/productService", () => ({
  getProducts: vi.fn(),
  getProductsFiltered: vi.fn(),
}));

const products = [
  makeProduct({ id: "mouse", name: "Mouse gamer", price: 100, stock: 8 }),
  makeProduct({
    id: "keyboard",
    name: "Teclado mecánico",
    price: 200,
    stock: 3,
  }),
  makeProduct({ id: "monitor", name: "Monitor 4K", price: 300, stock: 0 }),
];

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getProducts).mockResolvedValue(products);
  vi.mocked(getProductsFiltered).mockResolvedValue(products);
});

describe("Home catalog filters", () => {
  it("combines price and availability filters and can clear them", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    expect(await screen.findByText("Mouse gamer")).toBeInTheDocument();
    await user.type(
      screen.getByRole("spinbutton", { name: "Precio mínimo" }),
      "150",
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "Precio máximo" }),
      "250",
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Solo disponibles" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Teclado mecánico")).toBeInTheDocument();
      expect(screen.queryByText("Mouse gamer")).not.toBeInTheDocument();
      expect(screen.queryByText("Monitor 4K")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(await screen.findByText("Mouse gamer")).toBeInTheDocument();
    expect(screen.getByText("Monitor 4K")).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Ordenar productos" }),
      "nameAsc",
    );
    await waitFor(() => {
      expect(screen.getAllByRole("heading", { level: 3 })[0]).toHaveTextContent(
        "Monitor 4K",
      );
    });
    expect(getProductsFiltered).toHaveBeenCalledTimes(1);
  });
});
