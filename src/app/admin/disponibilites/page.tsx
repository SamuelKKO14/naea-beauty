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

function trimTime(t: string) {
  return t.slice(0, 5);
}

type ModalPlage = { heure_debut: string; heure_fin: string };

export default function DisponibilitesPage() {
  const [dispos, setDispos] = useState<Disponibilite[]>([]);
  const [dispoSpec, setDispoSpec] = useState<DisponibiliteSpecifique[]>([]);
  const [indispos, setIndispos] = useState<Indisponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalPlages, setModalPlages] = useState<ModalPlage[]>([]);
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
      supabase.from("disponibilites_specifiques").select("*").order("date_jour").order("heure_debut"),
      supabase.from("indisponibilites").select("*").order("date_debut", { ascending: false }),
    ]);
    setDispos(d || []);
    setDispoSpec(ds || []);
    setIndispos(i || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Index : Map<dateStr, DisponibiliteSpecifique[]> (toutes les plages actives du jour)
  const dispoSpecMap = useMemo(() => {
    const m = new Map<string, DisponibiliteSpecifique[]>();
    dispoSpec.forEach((ds) => {
      if (!ds.actif) return;
      const arr = m.get(ds.date_jour) || [];
      arr.push(ds);
      m.set(ds.date_jour, arr);
    });
    // Tri ascendant par heure_debut pour chaque jour
    m.forEach((arr) => arr.sort((a, b) => a.heure_debut.localeCompare(b.heure_debut)));
    return m;
  }, [dispoSpec]);

  const isIndispo = useCallback(
    (dateStr: string) => indispos.some((i) => dateStr >= i.date_debut && dateStr <= i.date_fin),
    [indispos]
  );

  const calDays = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [calMonth]);

  function getDayStatus(date: Date): "past" | "blocked" | "available" | "empty" {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return "past";
    const ds = dateToStr(date);
    if (isIndispo(ds)) return "blocked";
    const plages = dispoSpecMap.get(ds);
    if (plages && plages.length > 0) return "available";
    return "empty";
  }

  // --- Modale : ouvre avec toutes les plages du jour ---
  function openModal(date: Date) {
    const ds = dateToStr(date);
    const plages = dispoSpecMap.get(ds);
    setModalDate(date);
    if (plages && plages.length > 0) {
      setModalPlages(
        plages.map((p) => ({
          heure_debut: trimTime(p.heure_debut),
          heure_fin: trimTime(p.heure_fin),
        }))
      );
    } else {
      setModalPlages([{ heure_debut: "09:00", heure_fin: "19:00" }]);
    }
  }

  function addPlage() {
    setModalPlages((prev) => [...prev, { heure_debut: "14:00", heure_fin: "18:00" }]);
  }

  function removePlage(idx: number) {
    setModalPlages((prev) => prev.filter((_, i) => i !== idx));
  }

  function updatePlage(idx: number, field: "heure_debut" | "heure_fin", value: string) {
    setModalPlages((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  }

  // --- Save : DELETE all + INSERT new ---
  async function saveDay() {
    if (!modalDate) return;

    // Validation : chaque plage doit avoir debut < fin (sauf si fin = 00:00 = minuit)
    for (const p of modalPlages) {
      if (!p.heure_debut || !p.heure_fin) {
        flash("err", "Toutes les plages doivent avoir un début et une fin.");
        return;
      }
      if (p.heure_debut >= p.heure_fin && p.heure_fin !== "00:00") {
        flash("err", `Plage invalide : ${p.heure_debut} → ${p.heure_fin} (fin doit être après début).`);
        return;
      }
    }

    setModalSaving(true);
    const ds = dateToStr(modalDate);

    console.log("[saveDay] multi-plages", { ds, plages: modalPlages });

    // 1. DELETE toutes les lignes existantes pour ce jour
    const { error: delError } = await supabase
      .from("disponibilites_specifiques")
      .delete()
      .eq("date_jour", ds);

    if (delError) {
      console.error("[saveDay] delete error", delError);
      flash("err", `Erreur (delete) : ${delError.message}`);
      setModalSaving(false);
      return;
    }

    // 2. INSERT les nouvelles plages (si présentes)
    if (modalPlages.length > 0) {
      const rows = modalPlages.map((p) => ({
        date_jour: ds,
        heure_debut: p.heure_debut,
        heure_fin: p.heure_fin,
        actif: true,
      }));
      const { error: insError } = await supabase
        .from("disponibilites_specifiques")
        .insert(rows);
      if (insError) {
        console.error("[saveDay] insert error", insError);
        flash("err", `Erreur (insert) : ${insError.message}`);
        setModalSaving(false);
        return;
      }
    }

    await load();
    setModalSaving(false);
    setModalDate(null);
    flash(
      "ok",
      modalPlages.length === 0
        ? "Jour marqué indisponible."
        : `${modalPlages.length} plage(s) enregistrée(s).`
    );
  }

  // --- Supprimer toutes les plages du jour ---
  async function deleteDay() {
    if (!modalDate) return;
    const ds = dateToStr(modalDate);
    const { error } = await supabase
      .from("disponibilites_specifiques")
      .delete()
      .eq("date_jour", ds);
    if (error) {
      console.error("[deleteDay]", error);
      flash("err", `Erreur lors de la suppression : ${error.message}`);
      return;
    }
    await load();
    setModalDate(null);
    flash("ok", "Disponibilités du jour supprimées.");
  }

  function targetWeekDays(): Date[] {
    const today = new Date();
    const sameMonth =
      today.getFullYear() === calMonth.getFullYear() &&
      today.getMonth() === calMonth.getMonth();
    const ref = sameMonth ? today : new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
    return getWeekDays(ref);
  }

  // --- Apply default week : 1 plage par jour selon le modèle hebdo ---
  async function applyDefaultWeek() {
    const weekDays = targetWeekDays();
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);

    type Row = { date_jour: string; heure_debut: string; heure_fin: string; actif: boolean };
    const datesToReplace: string[] = [];
    const inserts: Row[] = [];

    for (const day of weekDays) {
      const ds = dateToStr(day);
      if (day < todayCheck) continue;
      if (isIndispo(ds)) continue;

      const dbDay = jsToDbDay(day.getDay());
      const defaultDispo = dispos.find((d) => d.jour_semaine === dbDay && d.actif);
      if (defaultDispo) {
        datesToReplace.push(ds);
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

    // DELETE puis INSERT (pour ne pas dupliquer si des plages existent déjà)
    const { error: delError } = await supabase
      .from("disponibilites_specifiques")
      .delete()
      .in("date_jour", datesToReplace);
    if (delError) {
      console.error("[applyDefaultWeek] delete", delError);
      flash("err", `Erreur : ${delError.message}`);
      return;
    }
    const { error: insError } = await supabase
      .from("disponibilites_specifiques")
      .insert(inserts);
    if (insError) {
      console.error("[applyDefaultWeek] insert", insError);
      flash("err", `Erreur : ${insError.message}`);
      return;
    }
    await load();
    flash("ok", `${inserts.length} jour(s) configuré(s).`);
  }

  // --- Copy previous week : copie toutes les plages de la semaine précédente ---
  async function copyPrevWeek() {
    const currentWeek = targetWeekDays();
    const prevWeek = currentWeek.map((d) => {
      const prev = new Date(d);
      prev.setDate(d.getDate() - 7);
      return prev;
    });

    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);

    type Row = { date_jour: string; heure_debut: string; heure_fin: string; actif: boolean };
    const datesToReplace: string[] = [];
    const inserts: Row[] = [];

    for (let i = 0; i < 7; i++) {
      const prevDs = dateToStr(prevWeek[i]);
      const curDs = dateToStr(currentWeek[i]);
      if (currentWeek[i] < todayCheck) continue;

      const prevPlages = dispoSpecMap.get(prevDs);
      if (prevPlages && prevPlages.length > 0) {
        datesToReplace.push(curDs);
        for (const p of prevPlages) {
          inserts.push({
            date_jour: curDs,
            heure_debut: p.heure_debut,
            heure_fin: p.heure_fin,
            actif: true,
          });
        }
      }
    }

    if (inserts.length === 0) {
      flash("err", "Aucune dispo trouvée la semaine précédente.");
      return;
    }

    const { error: delError } = await supabase
      .from("disponibilites_specifiques")
      .delete()
      .in("date_jour", datesToReplace);
    if (delError) {
      console.error("[copyPrevWeek] delete", delError);
      flash("err", `Erreur : ${delError.message}`);
      return;
    }
    const { error: insError } = await supabase
      .from("disponibilites_specifiques")
      .insert(inserts);
    if (insError) {
      console.error("[copyPrevWeek] insert", insError);
      flash("err", `Erreur : ${insError.message}`);
      return;
    }
    await load();
    flash("ok", `${inserts.length} plage(s) copiée(s).`);
  }

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

        <div className="flex flex-wrap gap-4 px-5 py-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-green-50 border border-green-200" /> Disponible</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-white border border-gray-200" /> Non défini</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-red-50 border border-red-200" /> Bloqué</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-gray-100 border border-gray-200" /> Passé</span>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100 text-center text-xs font-medium text-gray-500">
          {JOURS.map((j) => <div key={j} className="py-2">{j.slice(0, 3)}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-100 p-px">
          {calDays.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="bg-white p-2 min-h-[84px]" />;
            const status = getDayStatus(day);
            const ds = dateToStr(day);
            const plages = dispoSpecMap.get(ds) || [];
            const count = plages.length;
            const tooltip =
              count > 0
                ? plages
                    .map((p) => `${trimTime(p.heure_debut)}–${trimTime(p.heure_fin)}`)
                    .join(" · ")
                : undefined;
            return (
              <button
                key={ds}
                type="button"
                disabled={status === "past"}
                onClick={() => status !== "past" && openModal(day)}
                title={tooltip}
                className={`relative min-h-[84px] p-2 text-left transition-colors ${dayColors[status]}`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm">{day.getDate()}</span>
                  {count > 1 && (
                    <span className="ml-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                  {count === 1 && (
                    <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-600" />
                  )}
                </div>
                {count > 0 && (
                  <p className="mt-1 line-clamp-2 text-[10px] leading-tight text-green-700">
                    {plages
                      .slice(0, 2)
                      .map((p) => `${trimTime(p.heure_debut)}–${trimTime(p.heure_fin)}`)
                      .join(" · ")}
                    {count > 2 && ` · +${count - 2}`}
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

      {/* ── MODALE MULTI-PLAGES ── */}
      {modalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalDate(null)}>
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setModalDate(null)} className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100">
              <X size={18} />
            </button>

            <h3 className="font-semibold text-gray-900">
              {modalDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Définis une ou plusieurs plages horaires pour ce jour.
            </p>

            <div className="mt-5 space-y-3">
              {modalPlages.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  Aucune plage — ce jour sera indisponible.
                </div>
              ) : (
                modalPlages.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-14 text-xs font-medium text-gray-500">Plage {idx + 1}</span>
                    <input
                      type="time"
                      value={p.heure_debut}
                      onChange={(e) => updatePlage(idx, "heure_debut", e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                    />
                    <span className="text-xs text-gray-400">à</span>
                    <input
                      type="time"
                      value={p.heure_fin}
                      onChange={(e) => updatePlage(idx, "heure_fin", e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removePlage(idx)}
                      className="rounded-full p-1.5 text-red-500 hover:bg-red-50"
                      title="Supprimer cette plage"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={addPlage}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-bordeaux-400 hover:bg-bordeaux-50 hover:text-bordeaux-700"
              >
                <Plus size={14} />
                Ajouter une plage
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={saveDay}
                disabled={modalSaving}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bordeaux-700 px-4 py-2 text-sm font-medium text-white hover:bg-bordeaux-800 disabled:opacity-50"
              >
                <Save size={14} />
                {modalSaving ? "…" : "Enregistrer"}
              </button>
              {(dispoSpecMap.get(dateToStr(modalDate))?.length ?? 0) > 0 && (
                <button
                  onClick={deleteDay}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  Tout supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
