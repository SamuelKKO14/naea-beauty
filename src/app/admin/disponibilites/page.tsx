"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Save, Trash2, Plus } from "lucide-react";
import type { Disponibilite, Indisponibilite } from "@/lib/types";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function DisponibilitesPage() {
  const [dispos, setDispos] = useState<Disponibilite[]>([]);
  const [indispos, setIndispos] = useState<Indisponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newIndispo, setNewIndispo] = useState({ date_debut: "", date_fin: "", motif: "" });
  const supabase = createClient();

  const load = useCallback(async () => {
    const [{ data: d }, { data: i }] = await Promise.all([
      supabase.from("disponibilites").select("*").order("jour_semaine"),
      supabase.from("indisponibilites").select("*").order("date_debut", { ascending: false }),
    ]);
    setDispos(d || []);
    setIndispos(i || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateDispo(id: string, field: string, value: string | boolean) {
    setDispos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  }

  async function saveDispos() {
    setSaving(true);
    for (const d of dispos) {
      await supabase
        .from("disponibilites")
        .update({
          heure_debut: d.heure_debut,
          heure_fin: d.heure_fin,
          actif: d.actif,
        })
        .eq("id", d.id);
    }
    setSaving(false);
  }

  async function addIndispo() {
    if (!newIndispo.date_debut || !newIndispo.date_fin) return;
    await supabase.from("indisponibilites").insert({
      date_debut: newIndispo.date_debut,
      date_fin: newIndispo.date_fin,
      motif: newIndispo.motif || null,
    });
    setNewIndispo({ date_debut: "", date_fin: "", motif: "" });
    load();
  }

  async function deleteIndispo(id: string) {
    await supabase.from("indisponibilites").delete().eq("id", id);
    load();
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Disponibilités</h2>

      {/* Horaires par jour */}
      <div className="rounded-xl border border-white/20 bg-white/70 backdrop-blur-lg shadow-lg">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Horaires hebdomadaires</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {dispos.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center gap-4 px-5 py-3"
            >
              <div className="w-24">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={d.actif}
                    onChange={(e) => updateDispo(d.id, "actif", e.target.checked)}
                    className="accent-bordeaux-700"
                  />
                  <span
                    className={`text-sm font-medium ${d.actif ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {JOURS[d.jour_semaine]}
                  </span>
                </label>
              </div>
              <input
                type="time"
                value={d.heure_debut}
                onChange={(e) => updateDispo(d.id, "heure_debut", e.target.value)}
                disabled={!d.actif}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              />
              <span className="text-sm text-gray-400">à</span>
              <input
                type="time"
                value={d.heure_fin}
                onChange={(e) => updateDispo(d.id, "heure_fin", e.target.value)}
                disabled={!d.actif}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              />
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 px-5 py-4">
          <button
            onClick={saveDispos}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Sauvegarde…" : "Enregistrer les horaires"}
          </button>
        </div>
      </div>

      {/* Indisponibilités */}
      <div className="rounded-xl border border-white/20 bg-white/70 backdrop-blur-lg shadow-lg">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Indisponibilités</h3>
        </div>

        {/* Formulaire ajout */}
        <div className="flex flex-wrap items-end gap-3 border-b border-gray-50 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Du
            </label>
            <input
              type="date"
              value={newIndispo.date_debut}
              onChange={(e) =>
                setNewIndispo((p) => ({ ...p, date_debut: e.target.value }))
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Au
            </label>
            <input
              type="date"
              value={newIndispo.date_fin}
              onChange={(e) =>
                setNewIndispo((p) => ({ ...p, date_fin: e.target.value }))
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Motif
            </label>
            <input
              type="text"
              value={newIndispo.motif}
              onChange={(e) =>
                setNewIndispo((p) => ({ ...p, motif: e.target.value }))
              }
              placeholder="Vacances, formation…"
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={addIndispo}
            className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-white/30"
          >
            <Plus size={14} />
            Ajouter
          </button>
        </div>

        {/* Liste */}
        <div className="divide-y divide-gray-50">
          {indispos.length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-gray-400">
              Aucune indisponibilité programmée
            </p>
          )}
          {indispos.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="text-sm">
                <span className="font-medium text-gray-900">
                  {new Date(i.date_debut).toLocaleDateString("fr-FR")} →{" "}
                  {new Date(i.date_fin).toLocaleDateString("fr-FR")}
                </span>
                {i.motif && (
                  <span className="ml-2 text-gray-500">— {i.motif}</span>
                )}
              </div>
              <button
                onClick={() => deleteIndispo(i.id)}
                className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
