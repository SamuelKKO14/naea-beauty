"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Euro,
  Bell,
} from "lucide-react";
import type { Reservation } from "@/lib/types";

type Stats = {
  todayCount: number;
  weekCount: number;
  monthRevenue: number;
  nextRdv: (Reservation & { client_name: string; prestation_name: string }) | null;
  recentReservations: (Reservation & {
    client_name: string;
    prestation_name: string;
  })[];
};

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const weekStart = startOfWeek.toISOString().split("T")[0];
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    // RDV aujourd'hui
    const { count: todayCount } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("date_rdv", today)
      .not("statut", "eq", "annulee");

    // RDV cette semaine
    const { count: weekCount } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .gte("date_rdv", weekStart)
      .lte("date_rdv", today.slice(0, 8) + "31")
      .not("statut", "eq", "annulee");

    // CA du mois
    const { data: monthData } = await supabase
      .from("reservations")
      .select("montant_acompte")
      .gte("date_rdv", monthStart)
      .eq("acompte_paye", true);
    const monthRevenue = (monthData || []).reduce(
      (sum, r) => sum + Number(r.montant_acompte || 0),
      0
    );

    // Prochain RDV
    const { data: nextData } = await supabase
      .from("reservations")
      .select("*, client:clients(prenom, nom), prestation:prestations(nom)")
      .gte("date_rdv", today)
      .in("statut", ["en_attente", "confirmee"])
      .order("date_rdv", { ascending: true })
      .order("heure_rdv", { ascending: true })
      .limit(1);

    const nextRdv =
      nextData && nextData[0]
        ? {
            ...nextData[0],
            client_name: `${(nextData[0] as any).client?.prenom || ""} ${(nextData[0] as any).client?.nom || ""}`.trim(),
            prestation_name: (nextData[0] as any).prestation?.nom || "",
          }
        : null;

    // 5 dernières réservations
    const { data: recentData } = await supabase
      .from("reservations")
      .select("*, client:clients(prenom, nom), prestation:prestations(nom)")
      .order("created_at", { ascending: false })
      .limit(5);

    const recentRows = (recentData || []).map((r: any) => ({
      ...r,
      client_name: `${r.client?.prenom || ""} ${r.client?.nom || ""}`.trim(),
      prestation_name: r.prestation?.nom || "",
    }));
    const recentReservations = [...new Map(recentRows.map((r: any) => [r.id, r])).values()];

    setStats({
      todayCount: todayCount || 0,
      weekCount: weekCount || 0,
      monthRevenue,
      nextRdv: nextRdv as any,
      recentReservations,
    });
    setLoading(false);
  }, []);

  const loadRef = useRef(load);
  loadRef.current = load;

  // Debounce ref pour Realtime
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime : UN SEUL channel, re-fetch complet avec debounce 500ms
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-reservations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        (payload) => {
          console.log("Realtime event (dashboard):", payload);
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            loadRef.current();
          }, 500);
          if (payload.eventType === "INSERT") {
            setToast(true);
            setTimeout(() => setToast(false), 5000);
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime status (dashboard):", status);
      });
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Chargement…
      </div>
    );
  }

  if (!stats) return null;

  const kpis = [
    {
      label: "RDV aujourd'hui",
      value: stats.todayCount,
      icon: CalendarCheck,
      color: "text-bordeaux-700 bg-bordeaux-50",
    },
    {
      label: "RDV cette semaine",
      value: stats.weekCount,
      icon: CalendarDays,
      color: "text-blue-700 bg-blue-50",
    },
    {
      label: "CA du mois",
      value: `${stats.monthRevenue.toFixed(2).replace(".", ",")} €`,
      icon: Euro,
      color: "text-green-700 bg-green-50",
    },
    {
      label: "Prochain RDV",
      value: stats.nextRdv
        ? stats.nextRdv.prestation_name
        : "Aucun",
      sub: stats.nextRdv
        ? `${stats.nextRdv.client_name} — ${new Date(stats.nextRdv.date_rdv).toLocaleDateString("fr-FR")} à ${stats.nextRdv.heure_rdv?.slice(0, 5)}`
        : undefined,
      icon: Clock,
      color: "text-or-700 bg-or-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <Bell size={16} />
          Nouvelle réservation !
        </div>
      )}

      <h2 className="text-2xl font-bold text-white">Dashboard</h2>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-gray-200 bg-white shadow-sm p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{kpi.label}</p>
                <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                {kpi.sub && (
                  <p className="text-xs text-gray-400">{kpi.sub}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dernières réservations */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">
            Dernières réservations
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Prestation</th>
                <th className="px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentReservations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                    Aucune réservation pour le moment
                  </td>
                </tr>
              )}
              {stats.recentReservations.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-gray-700">
                    {new Date(r.date_rdv).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3 text-gray-900">{r.client_name}</td>
                  <td className="px-5 py-3 text-gray-700">
                    {r.prestation_name}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[r.statut] || ""}`}
                    >
                      {STATUT_LABELS[r.statut] || r.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
