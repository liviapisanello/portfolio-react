"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { contactSchema, type ContactFormValues } from "@/lib/contact-validation";

const initialValues: ContactFormValues = { name: "", email: "", subject: "", message: "" };
type FormStatus = { kind: "success" | "error"; text: string } | null;

export function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [status, setStatus] = useState<FormStatus>(null);
  const [isSending, setIsSending] = useState(false);

  function updateField(field: keyof ContactFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;
    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        subject: fieldErrors.subject?.[0],
        message: fieldErrors.message?.[0],
      });
      setStatus({ kind: "error", text: "Revise os campos destacados." });
      return;
    }

    setErrors({});
    setIsSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const body: { error?: string; emailSent?: boolean } = await response.json();
      if (!response.ok) {
        setStatus({
          kind: "error",
          text: body.error || "Não foi possível enviar sua mensagem. Tente novamente.",
        });
        return;
      }
      setValues(initialValues);
      setStatus({
        kind: "success",
        text:
          body.emailSent === false
            ? "Mensagem salva, mas a notificação por e-mail falhou. Se for urgente, escreva diretamente para livia.laur26@gmail.com."
            : "Mensagem enviada! Obrigada por entrar em contato.",
      });
    } catch {
      setStatus({
        kind: "error",
        text: "Falha de conexão. Verifique sua internet e tente novamente.",
      });
    } finally {
      setIsSending(false);
    }
  }

  const fieldError = (field: keyof ContactFormValues) => errors[field];

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label>
          Seu nome
          <input
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            aria-invalid={Boolean(fieldError("name"))}
            aria-describedby={fieldError("name") ? "name-error" : undefined}
          />
          {fieldError("name") && (
            <span className="field-error" id="name-error">
              {fieldError("name")}
            </span>
          )}
        </label>
        <label>
          Seu e-mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(fieldError("email"))}
            aria-describedby={fieldError("email") ? "email-error" : undefined}
          />
          {fieldError("email") && (
            <span className="field-error" id="email-error">
              {fieldError("email")}
            </span>
          )}
        </label>
      </div>
      <label>
        Assunto
        <input
          name="subject"
          value={values.subject}
          onChange={(event) => updateField("subject", event.target.value)}
          aria-invalid={Boolean(fieldError("subject"))}
          aria-describedby={fieldError("subject") ? "subject-error" : undefined}
        />
        {fieldError("subject") && (
          <span className="field-error" id="subject-error">
            {fieldError("subject")}
          </span>
        )}
      </label>
      <label>
        Mensagem
        <textarea
          name="message"
          rows={5}
          value={values.message}
          onChange={(event) => updateField("message", event.target.value)}
          aria-invalid={Boolean(fieldError("message"))}
          aria-describedby={fieldError("message") ? "message-error" : undefined}
        />
        {fieldError("message") && (
          <span className="field-error" id="message-error">
            {fieldError("message")}
          </span>
        )}
      </label>
      {status && (
        <p className={`form-status ${status.kind}`} role="status">
          {status.text}
        </p>
      )}
      <button className="button button-primary submit-button" type="submit" disabled={isSending}>
        {isSending ? (
          <>
            <LoaderCircle className="spin" size={17} /> Enviando...
          </>
        ) : (
          <>
            Enviar mensagem <Send size={16} />{" "}
          </>
        )}
      </button>
    </form>
  );
}
