"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import {
  Save,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  CalendarDays,
  Ban,
} from "lucide-react";
import type {
  Disponibilite,
  Indisponibilite,
  DisponibiliteSpecifique,
} from "@/lib/types";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function dateToStr(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

function jsToDbDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diff);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

export default function DisponibilitesPage() {
  const [dispos, setDispos] = useState<Disponibilite[]>([]);
  const [dispoSpec, setDispoSpec] = useState<DisponibiliteSpecifique[]>([]);
  const [indispos, setIndispos] = useState<Indisponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newIndispo, setNewIndispo] = useState({ date_debut: "", date_fin: "", motif: "" });
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalDispo, setModalDispo] = useState(true);
  const [modalDebut, setModalDebut] = useState("09:00");
  const [modalFin, setModalFin] = useState("19:00");
  const [modalSaving, setModalSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  function flash(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 3500);
  }

  const supabase = createClient();

  const load = useCallback(async () => {
    const [{ data: d }, { data: ds }, { data: i }] = await Promise.all([
      supabase.from("disponibilites").select("*").order("jour_semaine"),
      supabase.from("disponibilites_specifiques").select("*").order("date_jour"),
      supabase.from("indisponibilites").select("*").order("date_debut", { ascending: false }),
    ]);
    setDispos(d || []);
    setDispoSpec(ds || []);
    setIndispos(i || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // --- Dispos spécifiques map ---
  const dispoSpecMap = useMemo(() => {
    const m = new Map<string, DisponibiliteSpecifique>();
    dispoSpec.forEach((ds) => m.set(ds.date_jour, ds));
    return m;
  }, [dispoSpec]);

  // --- Is date indisponible ---
  const isIndispo = useCallback(
    (dateStr: string) => indispos.some((i) => dateStr >= i.date_debut && dateStr <= i.date_fin),
    [indispos]
  );

  // --- Calendar days ---
  const calDays = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [calMonth]);

  // --- Day status ---
  function getDayStatus(date: Date): "past" | "blocked" | "available" | "empty" {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return "past";
    const ds = dateToStr(date);
    if (isIndispo(ds)) return "blocked";
    const spec = dispoSpecMap.get(ds);
    if (spec && spec.actif) return "available";
    return "empty";
  }

  // --- Open modal ---
  function openModal(date: Date) {
    const ds = dateToStr(date);
    const spec = dispoSpecMap.get(ds);
    setModalDate(date);
    if (spec) {
      setModalDispo(spec.actif);
      setModalDebut(spec.heure_debut.slice(0, 5));
      setModalFin(spec.heure_fin.slice(0, 5));
    } else {
      setModalDispo(true);
      setModalDebut("09:00");
      setModalFin("19:00");
    }
  }

  // --- Save day dispo ---
  async function saveDay() {
    if (!modalDate) return;
    if (modalDispo && modalDebut >= modalFin && modalFin !== "00:00") {
      flash("err", "L'heure de fin doit être après l'heure de début.");
      return;
    }
    setModalSaving(true);
    const ds = dateToStr(modalDate);
    const existing = dispoSpecMap.get(ds);

    console.log("[saveDay]", { ds, existingId: existing?.id, modalDispo, modalDebut, modalFin });

    let error;
    if (modalDispo) {
      if (existing) {
        ({ error } = await supabase.from("disponibilites_specifiques").update({
          heure_debut: modalDebut,
          heure_fin: modalFin,
          actif: true,
        }).eq("id", existing.id));
      } else {
        ({ error } = await supabase.from("disponibilites_specifiques").insert({
          date_jour: ds,
          heure_debut: modalDebut,
          heure_fin: modalFin,
          actif: true,
        }));
      }
    } else if (existing) {
      ({ error } = await supabase
        .from("disponibilites_specifiques")
        .update({ actif: false })
        .eq("id", existing.id));
    }

    if (error) {
      console.error("[saveDay] error", error);
      flash("err", `Erreur d'enregistrement : ${error.message}`);
      setModalSaving(false);
      return;
    }

    await load();
    setModalSaving(false);
    setModalDate(null);
    flash("ok", "Disponibilité enregistrée.");
  }

  // --- Delete day dispo ---
  async function deleteDay() {
    if (!modalDate) return;
    const ds = dateToStr(modalDate);
    const existing = dispoSpecMap.get(ds);
    if (existing) {
      const { error } = await supabase
        .from("disponibilites_specifiques")
        .delete()
        .eq("id", existing.id);
      if (error) {
        console.error("[deleteDay] error", error);
        flash("err", `Erreur lors de la suppression : ${error.message}`);
        return;
      }
      await load();
      flash("ok", "Disponibilité supprimée.");
    }
    setModalDate(null);
  }

  // Détermine la semaine cible : si on regarde le mois courant → semaine de "aujourd'hui",
  // sinon → première semaine du mois affiché (jour 1).
  function targetWeekDays(): Date[] {
    const today = new Date();
    const sameMonth =
      today.getFullYear() === calMonth.getFullYear() &&
      today.getMonth() === calMonth.getMonth();
    const ref = sameMonth ? today : new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
    return getWeekDays(ref);
  }

  // --- Apply default week ---
  async function applyDefaultWeek() {
    const weekDays = targetWeekDays();
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);

    const inserts: { date_jour: string; heure_debut: string; heure_fin: string; actif: boolean }[] = [];
    for (const day of weekDays) {
      const ds = dateToStr(day);
      if (day < todayCheck) continue;
      if (isIndispo(ds)) continue;

      const dbDay = jsToDbDay(day.getDay());
      const defaultDispo = dispos.find((d) => d.jour_semaine === dbDay && d.actif);
      if (defaultDispo) {
        inserts.push({
          date_jour: ds,
          heure_debut: defaultDispo.heure_debut,
          heure_fin: defaultDispo.heure_fin,
          actif: true,
        });
      }
    }

    if (inserts.length === 0) {
      flash("err", "Aucun horaire hebdo à appliquer pour cette semaine.");
      return;
    }
    const { error } = await supabase
      .from("disponibilites_specifiques")
      .upsert(inserts, { onConflict: "date_jour" });
    if (error) {
      console.error("[applyDefaultWeek]", error);
      flash("err", `Erreur : ${error.message}`);
      return;
    }
    await load();
    flash("ok", `${inserts.length} jour(s) configuré(s).`);
  }

  // --- Copy previous week ---
  async function copyPrevWeek() {
    const currentWeek = targetWeekDays();
    const prevWeek = currentWeek.map((d) => {
      const prev = new Date(d);
      prev.setDate(d.getDate() - 7);
      return prev;
    });

    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);
    const inserts: { date_jour: string; heure_debut: string; heure_fin: string; actif: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const prevDs = dateToStr(prevWeek[i]);
      const curDs = dateToStr(currentWeek[i]);
      if (currentWeek[i] < todayCheck) continue;

      const prevSpec = dispoSpecMap.get(prevDs);
      if (prevSpec && prevSpec.actif) {
        inserts.push({
          date_jour: curDs,
          heure_debut: prevSpec.heure_debut,
          heure_fin: prevSpec.heure_fin,
          actif: true,
        });
      }
    }

    if (inserts.length === 0) {
      flash("err", "Aucune dispo trouvée la semaine précédente.");
      return;
    }
    const { error } = await supabase
      .from("disponibilites_specifiques")
      .upsert(inserts, { onConflict: "date_jour" });
    if (error) {
      console.error("[copyPrevWeek]", error);
      flash("err", `Erreur : ${error.message}`);
      return;
    }
    await load();
    flash("ok", `${inserts.length} jour(s) copié(s).`);
  }

  // --- Block entire week ---
  async function blockWeek() {
    if (!confirm("Bloquer toute la semaine ? Les dispos existantes seront supprimées.")) return;
    const weekDays = targetWeekDays();
    const dates = weekDays.map(dateToStr);
    const { error } = await supabase
      .from("disponibilites_specifiques")
      .delete()
      .in("date_jour", dates);
    if (error) {
      console.error("[blockWeek]", error);
      flash("err", `Erreur : ${error.message}`);
      return;
    }
    await load();
    flash("ok", "Semaine bloquée.");
  }

  // --- Indisponibilités ---
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

  // --- Horaires hebdo ---
  function updateDispo(id: string, field: string, value: string | boolean) {
    setDispos((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  }

  async function saveDispos() {
    setSaving(true);
    let firstError: string | null = null;
    for (const d of dispos) {
      const { error } = await supabase.from("disponibilites").update({
        heure_debut: d.heure_debut,
        heure_fin: d.heure_fin,
        actif: d.actif,
      }).eq("id", d.id);
      if (error && !firstError) firstError = error.message;
    }
    setSaving(false);
    if (firstError) {
      flash("err", `Erreur : ${firstError}`);
    } else {
      flash("ok", "Horaires hebdo enregistrés.");
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Chargement…</div>;
  }

  const dayColors: Record<string, string> = {
    past: "bg-gray-100 text-gray-400 cursor-default",
    blocked: "bg-red-50 text-red-400 cursor-pointer",
    available: "bg-green-50 text-green-800 font-semibold cursor-pointer hover:bg-green-100",
    empty: "bg-white text-gray-600 cursor-pointer hover:bg-gray-50",
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Disponibilités</h2>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.kind === "ok"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── CALENDRIER MENSUEL ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Planning — Vue mois</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="rounded p-1 text-gray-600 hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <span className="min-w-[140px] text-center text-sm font-semibold text-gray-900">
              {MOIS[calMonth.getMonth()]} {calMonth.getFullYear()}
            </span>
            <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="rounded p-1 text-gray-600 hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-2 border-b border-gray-50 px-5 py-3">
          <button onClick={applyDefaultWeek} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
            <CalendarDays size={14} />
            Appliquer horaires habituels (semaine)
          </button>
          <button onClick={copyPrevWeek} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
            <Copy size={14} />
            Copier semaine précédente
          </button>
          <button onClick={blockWeek} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
            <Ban size={14} />
            Bloquer toute la semaine
          </button>
        </div>

        {/* Légende */}
        <div className="flex flex-wrap gap-4 px-5 py-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-green-50 border border-green-200" /> Disponible</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-white border border-gray-200" /> Non défini</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-red-50 border border-red-200" /> Bloqué</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-gray-100 border border-gray-200" /> Passé</span>
        </div>

        {/* Jours semaine header */}
        <div className="grid grid-cols-7 border-b border-gray-100 text-center text-xs font-medium text-gray-500">
          {JOURS.map((j) => <div key={j} className="py-2">{j.slice(0, 3)}</div>)}
        </div>

        {/* Grille */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 p-px">
          {calDays.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="bg-white p-2 min-h-[72px]" />;
            const status = getDayStatus(day);
            const ds = dateToStr(day);
            const spec = dispoSpecMap.get(ds);
            return (
              <button
                key={ds}
                type="button"
                disabled={status === "past"}
                onClick={() => status !== "past" && openModal(day)}
                className={`min-h-[72px] p-2 text-left transition-colors ${dayColors[status]}`}
              >
                <span className="text-sm">{day.getDate()}</span>
                {spec && spec.actif && (
                  <p className="mt-0.5 text-[10px] leading-tight text-green-600">
                    {spec.heure_debut.slice(0, 5)}–{spec.heure_fin.slice(0, 5)}
                  </p>
                )}
                {status === "blocked" && (
                  <p className="mt-0.5 text-[10px] leading-tight text-red-500">Bloqué</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MODALE JOUR ── */}
      {modalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalDate(null)}>
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setModalDate(null)} className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100">
              <X size={18} />
            </button>

            <h3 className="font-semibold text-gray-900">
              {modalDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h3>

            <div className="mt-5 space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={modalDispo}
                  onChange={(e) => setModalDispo(e.target.checked)}
                  className="accent-green-600"
                />
                <span className="text-sm font-medium text-gray-900">Disponible ce jour</span>
              </label>

              {modalDispo && (
                <div className="flex items-center gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Début</label>
                    <input type="time" value={modalDebut} onChange={(e) => setModalDebut(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                  </div>
                  <span className="mt-5 text-sm text-gray-400">à</span>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Fin</label>
                    <input type="time" value={modalFin} onChange={(e) => setModalFin(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={saveDay}
                  disabled={modalSaving}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bordeaux-700 px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-800 disabled:opacity-50"
                >
                  <Save size={14} />
                  {modalSaving ? "…" : "Enregistrer"}
                </button>
                {dispoSpecMap.has(dateToStr(modalDate)) && (
                  <button
                    onClick={deleteDay}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HORAIRES HEBDOMADAIRES (modèle par défaut) ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Horaires hebdomadaires (modèle par défaut)</h3>
          <p className="mt-1 text-xs text-gray-500">Servent de base pour le bouton &quot;Appliquer horaires habituels&quot;</p>
        </div>
        <div className="divide-y divide-gray-50">
          {dispos.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
              <div className="w-24">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={d.actif} onChange={(e) => updateDispo(d.id, "actif", e.target.checked)} className="accent-bordeaux-700" />
                  <span className={`text-sm font-medium ${d.actif ? "text-gray-900" : "text-gray-400"}`}>{JOURS[d.jour_semaine]}</span>
                </label>
              </div>
              <input type="time" value={d.heure_debut} onChange={(e) => updateDispo(d.id, "heure_debut", e.target.value)} disabled={!d.actif} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40" />
              <span className="text-sm text-gray-400">à</span>
              <input type="time" value={d.heure_fin} onChange={(e) => updateDispo(d.id, "heure_fin", e.target.value)} disabled={!d.actif} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40" />
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 px-5 py-4">
          <button onClick={saveDispos} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-bordeaux-700 px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-800 disabled:opacity-50">
            <Save size={14} />
            {saving ? "Sauvegarde…" : "Enregistrer les horaires"}
          </button>
        </div>
      </div>

      {/* ── INDISPONIBILITÉS ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Indisponibilités</h3>
        </div>
        <div className="flex flex-wrap items-end gap-3 border-b border-gray-50 px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Du</label>
            <input type="date" value={newIndispo.date_debut} onChange={(e) => setNewIndispo((p) => ({ ...p, date_debut: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Au</label>
            <input type="date" value={newIndispo.date_fin} onChange={(e) => setNewIndispo((p) => ({ ...p, date_fin: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">Motif</label>
            <input type="text" value={newIndispo.motif} onChange={(e) => setNewIndispo((p) => ({ ...p, motif: e.target.value }))} placeholder="Vacances, formation…" className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
          </div>
          <button onClick={addIndispo} className="flex items-center gap-1.5 rounded-lg bg-bordeaux-700 px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-800">
            <Plus size={14} />
            Ajouter
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {indispos.length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-gray-400">Aucune indisponibilité programmée</p>
          )}
          {indispos.map((i) => (
            <div key={i.id} className="flex items-center justify-between px-5 py-3">
              <div className="text-sm">
                <span className="font-medium text-gray-900">
                  {new Date(i.date_debut).toLocaleDateString("fr-FR")} → {new Date(i.date_fin).toLocaleDateString("fr-FR")}
                </span>
                {i.motif && <span className="ml-2 text-gray-500">— {i.motif}</span>}
              </div>
              <button onClick={() => deleteIndispo(i.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
