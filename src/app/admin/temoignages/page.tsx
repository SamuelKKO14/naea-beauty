"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Plus, Star, X, Save } from "lucide-react";
import type { Temoignage } from "@/lib/types";

export default function TemoignagesPage() {
  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    prenom_affiche: "",
    prestation_nom: "",
    contenu: "",
    note: 5,
  });
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("temoignages")
      .select("*")
      .order("created_at", { ascending: false });
    setTemoignages(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleAffiche(id: string, current: boolean) {
    await supabase
      .from("temoignages")
      .update({ affiche: !current })
      .eq("id", id);
    load();
  }

  async function addTemoignage() {
    if (!form.prenom_affiche || !form.contenu) return;
    setSaving(true);
    await supabase.from("temoignages").insert({
      prenom_affiche: form.prenom_affiche,
      prestation_nom: form.prestation_nom,
      contenu: form.contenu,
      note: form.note,
      affiche: false,
    });
    setSaving(false);
    setShowAdd(false);
    setForm({ prenom_affiche: "", prestation_nom: "", contenu: "", note: 5 });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Témoignages</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-lg bg-bordeaux-700 px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-800"
        >
          <Plus size={14} />
          Ajouter
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-5 py-3">Prénom</th>
                <th className="px-5 py-3">Prestation</th>
                <th className="px-5 py-3">Note</th>
                <th className="px-5 py-3">Extrait</th>
                <th className="px-5 py-3">Affiché</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    Chargement…
                  </td>
                </tr>
              )}
              {!loading && temoignages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    Aucun témoignage
                  </td>
                </tr>
              )}
              {temoignages.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {t.prenom_affiche}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {t.prestation_nom}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.note }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className="fill-or-400 text-or-400"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="max-w-xs truncate px-5 py-3 text-gray-600">
                    {t.contenu}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleAffiche(t.id, t.affiche)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        t.affiche ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          t.affiche ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale ajout */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nouveau témoignage
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Prénom affiché
                </label>
                <input
                  type="text"
                  value={form.prenom_affiche}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, prenom_affiche: e.target.value }))
                  }
                  placeholder="Ex : Camille D."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Prestation
                </label>
                <input
                  type="text"
                  value={form.prestation_nom}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, prestation_nom: e.target.value }))
                  }
                  placeholder="Ex : Réhaussement de cils"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Contenu
                </label>
                <textarea
                  value={form.contenu}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contenu: e.target.value }))
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Note
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, note: n }))}
                    >
                      <Star
                        size={24}
                        className={
                          n <= form.note
                            ? "fill-or-400 text-or-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={addTemoignage}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-bordeaux-700 px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-800 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Ajout…" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
