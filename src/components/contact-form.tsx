"use client";

import { useState } from "react";
import { Calendar, Check } from "lucide-react";
import { SERVICES } from "@/lib/services";

type Status = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full rounded-lg border border-bordeaux-200 bg-white px-4 py-3 text-bordeaux-950 placeholder:text-gray-400 outline-none transition-all focus:border-or-500 focus:shadow-[0_0_0_3px_rgba(201,169,97,0.12)]";

const labelClass = "mb-1.5 block text-sm font-medium text-bordeaux-900";

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
      <h3 className="font-display text-2xl text-bordeaux-900">
        Réserver votre rendez-vous
      </h3>

      {/* Prestation */}
      <div>
        <label className={labelClass}>
          Prestation souhaitée <span className="text-or-700">*</span>
        </label>
        <select name="service" required defaultValue="" className={inputClass}>
          <option value="" disabled className="text-gray-400">
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Date souhaitée <span className="text-or-700">*</span>
          </label>
          <input type="date" name="date" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>
            Créneau horaire préféré <span className="text-or-700">*</span>
          </label>
          <select
            name="timeslot"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled className="text-gray-400">
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
          <label className="flex cursor-pointer items-center gap-2 text-sm text-bordeaux-900">
            <input
              type="radio"
              name="location"
              value="chez-naea"
              defaultChecked
              className="accent-or-500"
            />
            Chez Naéa, Nantes
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-bordeaux-900">
            <input
              type="radio"
              name="location"
              value="domicile"
              className="accent-or-500"
            />
            À mon domicile
          </label>
        </div>
      </fieldset>

      {/* Prénom + Nom */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Prénom <span className="text-or-700">*</span>
          </label>
          <input
            name="firstName"
            type="text"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Nom <span className="text-or-700">*</span>
          </label>
          <input
            name="lastName"
            type="text"
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Téléphone + Email */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Téléphone <span className="text-or-700">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Email <span className="text-or-700">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Mode de paiement */}
      <div>
        <label className={labelClass}>Mode de paiement préféré</label>
        <select name="payment" defaultValue="especes" className={inputClass}>
          <option value="especes">Espèces</option>
          <option value="virement">Virement</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label className={labelClass}>
          Message complémentaire (optionnel)
        </label>
        <textarea
          name="message"
          rows={3}
          placeholder="Précisez vos disponibilités, questions, attentes…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Submit — shimmer doré */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-or-500 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-bordeaux-950 shadow-lg shadow-or-500/20 transition-all hover:shadow-xl hover:shadow-or-500/40 disabled:opacity-50"
      >
        <span className="pointer-events-none absolute inset-0 animate-shimmer-gold bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <span className="pointer-events-none absolute inset-0 rounded-full bg-or-300/0 transition-colors group-hover:bg-or-300/20" />
        <Calendar size={16} className="relative z-10" />
        <span className="relative z-10">
          {status === "loading" ? "Envoi…" : "Demander mon RDV"}
        </span>
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
