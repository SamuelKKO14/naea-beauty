"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { X, ExternalLink, Save, Search } from "lucide-react";
import type { Reservation, StatutReservation } from "@/lib/types";

const STATUTS: { value: StatutReservation | "tous"; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "en_attente", label: "En attente" },
  { value: "confirmee", label: "Confirmée" },
  { value: "realisee", label: "Réalisée" },
  { value: "annulee", label: "Annulée" },
  { value: "no_show", label: "No-show" },
];

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  realisee: "Réalisée",
  annulee: "Annulée",
  no_show: "No-show",
};

const STATUT_COLORS: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-800",
  confirmee: "bg-green-100 text-green-800",
  realisee: "bg-blue-100 text-blue-800",
  annulee: "bg-gray-100 text-gray-600",
  no_show: "bg-red-100 text-red-800",
};

type ReservationRow = Reservation & {
  client_name: string;
  client_email: string;
  client_phone: string;
  prestation_name: string;
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<string>("tous");
  const [filterDate, setFilterDate] = useState("");
  const [selected, setSelected] = useState<ReservationRow | null>(null);
  const [editStatut, setEditStatut] = useState<StatutReservation>("en_attente");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    let query = supabase
      .from("reservations")
      .select("*, client:clients(prenom, nom, email, telephone), prestation:prestations(nom)")
      .order("date_rdv", { ascending: false })
      .order("heure_rdv", { ascending: false });

    if (filterStatut !== "tous") {
      query = query.eq("statut", filterStatut);
    }
    if (filterDate) {
      query = query.eq("date_rdv", filterDate);
    }

    const { data } = await query;

    setReservations(
      (data || []).map((r: any) => ({
        ...r,
        client_name: `${r.client?.prenom || ""} ${r.client?.nom || ""}`.trim(),
        client_email: r.client?.email || "",
        client_phone: r.client?.telephone || "",
        prestation_name: r.prestation?.nom || "",
      }))
    );
    setLoading(false);
  }, [filterStatut, filterDate]);

  useEffect(() => {
    load();
  }, [load]);

  function openDetail(r: ReservationRow) {
    setSelected(r);
    setEditStatut(r.statut);
    setEditNotes(r.notes_admin || "");
  }

  async function saveDetail() {
    if (!selected) return;
    setSaving(true);
    await supabase
      .from("reservations")
      .update({ statut: editStatut, notes_admin: editNotes, updated_at: new Date().toISOString() })
      .eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    load();
  }

  function googleCalendarUrl(r: ReservationRow) {
    const dateStr = r.date_rdv.replace(/-/g, "");
    const timeStr = (r.heure_rdv || "09:00:00").replace(/:/g, "").slice(0, 4) + "00";
    const start = `${dateStr}T${timeStr}`;
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${r.prestation_name} — ${r.client_name}`,
      dates: `${start}/${start}`,
      details: `Cliente: ${r.client_name}\nTél: ${r.client_phone}\nLieu: ${r.lieu === "chez_naea" ? "Chez Naéa" : "Domicile"}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Réservations</h2>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {STATUTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate("")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Effacer la date
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Heure</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Prestation</th>
                <th className="px-5 py-3">Lieu</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Acompte</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    Chargement…
                  </td>
                </tr>
              )}
              {!loading && reservations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    Aucune réservation
                  </td>
                </tr>
              )}
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => openDetail(r)}
                  className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-0"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-gray-700">
                    {new Date(r.date_rdv).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {r.heure_rdv?.slice(0, 5)}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {r.client_name}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {r.prestation_name}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {r.lieu === "chez_naea" ? "Chez Naéa" : "Domicile"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[r.statut]}`}
                    >
                      {STATUT_LABELS[r.statut]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {r.acompte_paye ? (
                      <span className="text-green-700">
                        {Number(r.montant_acompte).toFixed(2).replace(".", ",")} €
                      </span>
                    ) : (
                      <span className="text-amber-600">En attente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale détail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détail réservation
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500">Cliente</p>
                  <p className="text-gray-900">{selected.client_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Prestation</p>
                  <p className="text-gray-900">{selected.prestation_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Date</p>
                  <p className="text-gray-900">
                    {new Date(selected.date_rdv).toLocaleDateString("fr-FR")} à{" "}
                    {selected.heure_rdv?.slice(0, 5)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Lieu</p>
                  <p className="text-gray-900">
                    {selected.lieu === "chez_naea" ? "Chez Naéa" : "Domicile"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{selected.client_email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Téléphone</p>
                  <p className="text-gray-900">{selected.client_phone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Montant total</p>
                  <p className="text-gray-900">
                    {Number(selected.montant_total).toFixed(2).replace(".", ",")} €
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Acompte</p>
                  <p className="text-gray-900">
                    {Number(selected.montant_acompte).toFixed(2).replace(".", ",")} € —{" "}
                    {selected.acompte_paye ? (
                      <span className="text-green-700">Payé</span>
                    ) : (
                      <span className="text-amber-600">En attente</span>
                    )}
                  </p>
                </div>
              </div>

              {selected.notes_client && (
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Message cliente
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    {selected.notes_client}
                  </p>
                </div>
              )}

              {/* Statut */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Statut
                </label>
                <select
                  value={editStatut}
                  onChange={(e) =>
                    setEditStatut(e.target.value as StatutReservation)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {STATUTS.filter((s) => s.value !== "tous").map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes admin */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Notes admin
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
              <a
                href={googleCalendarUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-bordeaux-700 hover:underline"
              >
                <ExternalLink size={14} />
                Ajouter à Google Agenda
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={saveDetail}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-bordeaux-700 px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-800 disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? "Sauvegarde…" : "Sauvegarder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
