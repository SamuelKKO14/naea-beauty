"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { SERVICES } from "@/lib/services";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("error");
      setStatus("success");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-or-100">
          <Check className="text-or-700" size={32} />
        </div>
        <h2 className="mt-6 font-display text-3xl text-bordeaux-900">
          Demande reçue ✨
        </h2>
        <p className="mt-3 max-w-sm text-bordeaux-900/70">
          Merci ! Je reviens vers vous dans la journée pour confirmer votre
          rendez-vous.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <h2 className="font-display text-3xl text-bordeaux-900">
        Votre demande
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        <Field name="firstName" label="Prénom" required />
        <Field name="lastName" label="Nom" required />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="email" label="Email" type="email" required />
        <Field name="phone" label="Téléphone" type="tel" required />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-bordeaux-900">
          Prestation souhaitée <span className="text-or-700">*</span>
        </label>
        <select
          name="service"
          required
          defaultValue=""
          className="w-full rounded-lg border border-bordeaux-100 bg-cream px-4 py-3 text-bordeaux-900 outline-none transition-colors focus:border-bordeaux-400 focus:bg-white"
        >
          <option value="" disabled>
            Choisir une prestation
          </option>
          {SERVICES.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name} — {s.price} €
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-bordeaux-900">
            Date souhaitée
          </label>
          <input
            type="date"
            name="date"
            className="w-full rounded-lg border border-bordeaux-100 bg-cream px-4 py-3 text-bordeaux-900 outline-none transition-colors focus:border-bordeaux-400 focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-bordeaux-900">
            Lieu
          </label>
          <select
            name="location"
            defaultValue="domicile-naea"
            className="w-full rounded-lg border border-bordeaux-100 bg-cream px-4 py-3 text-bordeaux-900 outline-none transition-colors focus:border-bordeaux-400 focus:bg-white"
          >
            <option value="domicile-naea">Au domicile de Naéa</option>
            <option value="domicile-cliente">À mon domicile</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-bordeaux-900">
          Message (optionnel)
        </label>
        <textarea
          name="message"
          rows={4}
          placeholder="Précisez vos disponibilités, questions, attentes…"
          className="w-full resize-none rounded-lg border border-bordeaux-100 bg-cream px-4 py-3 text-bordeaux-900 outline-none transition-colors focus:border-bordeaux-400 focus:bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-bordeaux-800 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-or-100 transition-all hover:bg-bordeaux-900 hover:shadow-xl hover:shadow-bordeaux-800/20 disabled:opacity-50"
      >
        <Send size={16} />
        {status === "loading" ? "Envoi…" : "Envoyer ma demande"}
      </button>

      {status === "error" && (
        <p className="text-center text-sm text-bordeaux-700">
          Une erreur est survenue. Vous pouvez aussi me contacter sur Instagram
          @naea_beauty.
        </p>
      )}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-bordeaux-900">
        {label} {required && <span className="text-or-700">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-bordeaux-100 bg-cream px-4 py-3 text-bordeaux-900 outline-none transition-colors focus:border-bordeaux-400 focus:bg-white"
      />
    </div>
  );
}
