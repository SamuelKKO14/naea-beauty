"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Save } from "lucide-react";
import type { Parametre } from "@/lib/types";

export default function ParametresPage() {
  const [parametres, setParametres] = useState<Parametre[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("parametres")
      .select("*")
      .order("cle");
    setParametres(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateValue(cle: string, valeur: string) {
    setParametres((prev) =>
      prev.map((p) => (p.cle === cle ? { ...p, valeur } : p))
    );
    setSaved(false);
  }

  async function saveAll() {
    setSaving(true);
    for (const p of parametres) {
      await supabase
        .from("parametres")
        .update({ valeur: p.valeur, updated_at: new Date().toISOString() })
        .eq("cle", p.cle);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Paramètres</h2>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="divide-y divide-gray-50">
          {parametres.map((p) => {
            const isLongText =
              p.valeur.length > 80 ||
              p.cle.includes("message") ||
              p.cle.includes("consignes");

            return (
              <div key={p.cle} className="px-5 py-4">
                <div className="mb-1.5 flex items-baseline gap-2">
                  <label className="text-sm font-medium text-gray-900">
                    {p.cle.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </label>
                  {p.description && (
                    <span className="text-xs text-gray-400">
                      — {p.description}
                    </span>
                  )}
                </div>
                {isLongText ? (
                  <textarea
                    value={p.valeur}
                    onChange={(e) => updateValue(p.cle, e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={p.valeur}
                    onChange={(e) => updateValue(p.cle, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-bordeaux-700 px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-800 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Sauvegarde…" : "Enregistrer tout"}
          </button>
          {saved && (
            <span className="text-sm text-green-600">
              Paramètres sauvegardés ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
