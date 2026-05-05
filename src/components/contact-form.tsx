"use client";

import { useState } from "react";
import { Calendar, Check } from "lucide-react";
import { SERVICES } from "@/lib/services";

type Status = "idle" | "loading" | "success" | "error";

export function ReservationForm() {
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
        <h3 className="mt-6 font-display text-3xl text-bordeaux-900">
          Demande reçue !
        </h3>
        <p className="mt-3 max-w-sm text-bordeaux-900/70">
          Merci ! Je reviens vers vous dans la journée pour confirmer votre
          rendez-vous.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <h3 className="font-display text-3xl text-bordeaux-900">
        Réserver votre rendez-vous
      </h3>

      {/* Prestation */}
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

      {/* Date + Créneau */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-bordeaux-900">
            Date souhaitée <span className="text-or-700">*</span>
          </label>
          <input
            type="date"
            name="date"
            required
            className="w-full rounded-lg border border-bordeaux-100 bg-cream px-4 py-3 text-bordeaux-900 outline-none transition-colors focus:border-bordeaux-400 focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-bordeaux-900">
            Créneau horaire préféré <span className="text-or-700">*</span>
          </label>
          <select
            name="timeslot"
            required
            defaultValue=""
            className="w-full rounded-lg border border-bordeaux-100 bg-cream px-4 py-3 text-bordeaux-900 outline-none transition-colors focus:border-bordeaux-400 focus:bg-white"
          >
            <option value="" disabled>
              Choisir un créneau
            </option>
            <option value="matin">Matin (9h – 12h)</option>
            <option value="apres-midi">Après-midi (13h – 17h)</option>
            <option value="soir">Soir (17h – 20h)</option>
          </select>
        </div>
      </div>

      {/* Lieu */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-bordeaux-900">
          Lieu <span className="text-or-700">*</span>
        </legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex items-center gap-2 text-sm text-bordeaux-900 cursor-pointer">
            <input
              type="radio"
              name="location"
              value="chez-naea"
              defaultChecked
              className="accent-bordeaux-800"
            />
            Chez Naéa, Nantes
          </label>
          <label className="flex items-center gap-2 text-sm text-bordeaux-900 cursor-pointer">
            <input
              type="radio"
              name="location"
              value="domicile"
              className="accent-bordeaux-800"
            />
            À mon domicile
          </label>
        </div>
      </fieldset>

      {/* Prénom + Nom */}
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="firstName" label="Prénom" required />
        <Field name="lastName" label="Nom" required />
      </div>

      {/* Téléphone + Email */}
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="phone" label="Téléphone" type="tel" required />
        <Field name="email" label="Email" type="email" required />
      </div>

      {/* Mode de paiement */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-bordeaux-900">
          Mode de paiement préféré
        </label>
        <select
          name="payment"
          defaultValue="especes"
          className="w-full rounded-lg border border-bordeaux-100 bg-cream px-4 py-3 text-bordeaux-900 outline-none transition-colors focus:border-bordeaux-400 focus:bg-white"
        >
          <option value="especes">Espèces</option>
          <option value="virement">Virement</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-bordeaux-900">
          Message complémentaire (optionnel)
        </label>
        <textarea
          name="message"
          rows={3}
          placeholder="Précisez vos disponibilités, questions, attentes…"
          className="w-full resize-none rounded-lg border border-bordeaux-100 bg-cream px-4 py-3 text-bordeaux-900 outline-none transition-colors focus:border-bordeaux-400 focus:bg-white"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-or-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-bordeaux-950 shadow-lg shadow-or-500/20 transition-all hover:bg-or-400 hover:shadow-xl hover:shadow-or-500/30 disabled:opacity-50"
      >
        <Calendar size={16} />
        {status === "loading" ? "Envoi…" : "Demander mon RDV"}
      </button>

      <p className="text-center text-sm text-bordeaux-900/60">
        Je vous reviens dans la journée pour confirmer votre créneau.
      </p>

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
