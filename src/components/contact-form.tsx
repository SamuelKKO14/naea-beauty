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
      <FloatingSelect
        name="service"
        label="Prestation souhaitée"
        required
      >
        <option value="" disabled>
          Choisir une prestation
        </option>
        {SERVICES.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name} — {s.price} €
          </option>
        ))}
      </FloatingSelect>

      {/* Date + Créneau */}
      <div className="grid gap-5 md:grid-cols-2">
        <FloatingInput name="date" label="Date souhaitée" type="date" required />
        <FloatingSelect name="timeslot" label="Créneau horaire" required>
          <option value="" disabled>
            Choisir un créneau
          </option>
          <option value="matin">Matin (9h – 12h)</option>
          <option value="apres-midi">Après-midi (13h – 17h)</option>
          <option value="soir">Soir (17h – 20h)</option>
        </FloatingSelect>
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
      <div className="grid gap-5 md:grid-cols-2">
        <FloatingInput name="firstName" label="Prénom" required />
        <FloatingInput name="lastName" label="Nom" required />
      </div>

      {/* Téléphone + Email */}
      <div className="grid gap-5 md:grid-cols-2">
        <FloatingInput name="phone" label="Téléphone" type="tel" required />
        <FloatingInput name="email" label="Email" type="email" required />
      </div>

      {/* Mode de paiement */}
      <FloatingSelect name="payment" label="Mode de paiement">
        <option value="especes">Espèces</option>
        <option value="virement">Virement</option>
        <option value="paypal">PayPal</option>
      </FloatingSelect>

      {/* Message */}
      <FloatingTextarea
        name="message"
        label="Message complémentaire (optionnel)"
        rows={3}
      />

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

/* ── Floating Input ────────────────────────────────────── */
function FloatingInput({
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
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(type === "date");

  return (
    <div className="group relative">
      <input
        name={name}
        type={type}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          setFilled(e.target.value.length > 0 || type === "date");
        }}
        placeholder=" "
        className="peer w-full rounded-xl border border-bordeaux-200/60 bg-white/60 px-4 pb-2.5 pt-6 text-bordeaux-900 outline-none backdrop-blur-sm transition-all duration-300 focus:border-or-400 focus:bg-white/80 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)]"
      />
      <label
        className={`pointer-events-none absolute left-4 transition-all duration-300 ${
          focused || filled
            ? "top-2 text-[10px] font-semibold text-or-600"
            : "top-4 text-sm text-bordeaux-500"
        }`}
      >
        {label} {required && <span className="text-or-700">*</span>}
      </label>
    </div>
  );
}

/* ── Floating Select ───────────────────────────────────── */
function FloatingSelect({
  name,
  label,
  required = false,
  children,
}: {
  name: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(false);

  return (
    <div className="group relative">
      <select
        name={name}
        required={required}
        defaultValue=""
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          setFilled(e.target.value.length > 0);
        }}
        onChange={(e) => setFilled(e.target.value.length > 0)}
        className="peer w-full appearance-none rounded-xl border border-bordeaux-200/60 bg-white/60 px-4 pb-2.5 pt-6 text-bordeaux-900 outline-none backdrop-blur-sm transition-all duration-300 focus:border-or-400 focus:bg-white/80 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)]"
      >
        {children}
      </select>
      <label
        className={`pointer-events-none absolute left-4 transition-all duration-300 ${
          focused || filled
            ? "top-2 text-[10px] font-semibold text-or-600"
            : "top-4 text-sm text-bordeaux-500"
        }`}
      >
        {label} {required && <span className="text-or-700">*</span>}
      </label>
      {/* Chevron */}
      <svg
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bordeaux-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

/* ── Floating Textarea ─────────────────────────────────── */
function FloatingTextarea({
  name,
  label,
  rows = 3,
}: {
  name: string;
  label: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(false);

  return (
    <div className="group relative">
      <textarea
        name={name}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          setFilled(e.target.value.length > 0);
        }}
        placeholder=" "
        className="peer w-full resize-none rounded-xl border border-bordeaux-200/60 bg-white/60 px-4 pb-3 pt-6 text-bordeaux-900 outline-none backdrop-blur-sm transition-all duration-300 focus:border-or-400 focus:bg-white/80 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)]"
      />
      <label
        className={`pointer-events-none absolute left-4 transition-all duration-300 ${
          focused || filled
            ? "top-2 text-[10px] font-semibold text-or-600"
            : "top-4 text-sm text-bordeaux-500"
        }`}
      >
        {label}
      </label>
    </div>
  );
}
