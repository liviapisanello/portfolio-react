import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/contact-form";

describe("formulário de contato", () => {
  afterEach(() => vi.restoreAllMocks());

  it("exibe mensagens específicas por campo sem enviar dados inválidos", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("Seu nome"), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText("Seu e-mail"), { target: { value: "email-invalido" } });
    fireEvent.change(screen.getByLabelText("Assunto"), { target: { value: "Oi" } });
    fireEvent.change(screen.getByLabelText("Mensagem"), { target: { value: "Curta" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar mensagem/i }));

    expect(
      await screen.findByText("Informe seu nome (mínimo de 2 caracteres)."),
    ).toBeInTheDocument();
    expect(screen.getByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(screen.getByText("O assunto deve ter no mínimo 4 caracteres.")).toBeInTheDocument();
    expect(screen.getByText("A mensagem deve ter no mínimo 20 caracteres.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
