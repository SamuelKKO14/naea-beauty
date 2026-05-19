"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Plus, Save, X } from "lucide-react";
import type { Prestation } from "@/lib/types";

const CATEGORIES: Record<string, string> = {
  cils: "Cils",
  sourcils: "Sourcils",
  sourire: "Sourire",
};

export default function PrestationsPage() {
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Prestation | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    description: "",
    categorie: "cils" as string,
    prix: "",
    duree_minutes: "",
    actif: true,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const supabase = createClient();

  function flash(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 3500);
  }

  function resetForm() {
    setForm({
      nom: "",
      description: "",
      categorie: "cils",
      prix: "",
      duree_minutes: "",
      actif: true,
    });
  }

  function openCreate() {
    resetForm();
    setSelected(null);
    setCreating(true);
  }

  function closeModal() {
    setSelected(null);
    setCreating(false);
  }

  async function createPrestation() {
    if (!form.nom || !form.prix || !form.duree_minutes) {
      flash("err", "Nom, prix et durée sont obligatoires.");
      return;
    }
    setSaving(true);
    // Trouver l'ordre max pour positionner la nouvelle à la fin
    const maxOrdre = prestations.reduce((m, p) => Math.max(m, p.ordre ?? 0), 0);
    const { error } = await supabase.from("prestations").insert({
      nom: form.nom,
      description: form.description || null,
      categorie: form.categorie,
      prix: parseFloat(form.prix),
      duree_minutes: parseInt(form.duree_minutes),
      actif: form.actif,
      ordre: maxOrdre + 1,
    });
    setSaving(false);
    if (error) {
      console.error("[createPrestation]", error);
      flash("err", `Erreur : ${error.message}`);
      return;
    }
    closeModal();
    await load();
    flash("ok", "Prestation créée.");
  }

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("prestations")
      .select("*")
      .order("ordre");
    setPrestations(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit(p: Prestation) {
    setSelected(p);
    setForm({
      nom: p.nom,
      description: p.description || "",
      categorie: p.categorie,
      prix: String(p.prix),
      duree_minutes: String(p.duree_minutes),
      actif: p.actif,
    });
  }

  async function savePrestation() {
    if (!selected) return;
    setSaving(true);
    await supabase
      .from("prestations")
      .update({
        nom: form.nom,
        description: form.description || null,
        categorie: form.categorie,
        prix: parseFloat(form.prix),
        duree_minutes: parseInt(form.duree_minutes),
        actif: form.actif,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    load();
  }

  const showModal = !!selected || creating;
  const modalTitle = creating ? "Nouvelle prestation" : "Modifier la prestation";

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.kind === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-white">Prestations</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-bordeaux-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-bordeaux-800"
        >
          <Plus size={16} />
          Ajouter une prestation
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Catégorie</th>
                <th className="px-5 py-3">Prix</th>
                <th className="px-5 py-3">Durée</th>
                <th className="px-5 py-3">Actif</th>
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
              {prestations.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => openEdit(p)}
                  className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {p.nom}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {CATEGORIES[p.categorie]}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {Number(p.prix).toFixed(2).replace(".", ",")} €
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {p.duree_minutes} min
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${p.actif ? "bg-green-500" : "bg-gray-300"}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale création / édition */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalTitle}
              </h3>
              <button
                onClick={closeModal}
                className="rounded p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Nom
                </label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Catégorie
                </label>
                <select
                  value={form.categorie}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categorie: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="cils">Cils</option>
                  <option value="sourcils">Sourcils</option>
                  <option value="sourire">Sourire</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.prix}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, prix: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    Durée (min)
                  </label>
                  <input
                    type="number"
                    value={form.duree_minutes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, duree_minutes: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.actif}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, actif: e.target.checked }))
                  }
                  className="accent-bordeaux-700"
                />
                <span className="text-sm text-gray-700">
                  Prestation active (visible sur le site)
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={creating ? createPrestation : savePrestation}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-bordeaux-700 px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-800 disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Sauvegarde…" : creating ? "Créer" : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
