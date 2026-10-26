import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome (mínimo de 2 caracteres).")
    .max(100, "O nome deve ter até 100 caracteres."),
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .max(254, "O e-mail deve ter até 254 caracteres."),
  subject: z
    .string()
    .trim()
    .min(4, "O assunto deve ter no mínimo 4 caracteres.")
    .max(120, "O assunto deve ter até 120 caracteres."),
  message: z
    .string()
    .trim()
    .min(20, "A mensagem deve ter no mínimo 20 caracteres.")
    .max(5000, "A mensagem deve ter até 5000 caracteres."),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
