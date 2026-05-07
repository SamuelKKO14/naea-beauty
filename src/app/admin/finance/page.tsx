"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import {
  Euro,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Download,
  ShoppingBag,
  Ban,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import type { Reservation } from "@/lib/types";

type FullReservation = Reservation & {
  client_name: string;
  prestation_name: string;
};

const COLORS = ["#6e1f3c", "#c9a961", "#a94666", "#8a6c2c", "#c66880", "#d4af3f"];

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function monthLabel(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
}

function monthRange(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  d.setMonth(d.getMonth() + 1);
  const end = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  return { start, end };
}

export default function FinancePage() {
  const [reservations, setReservations] = useState<FullReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterPrestation, setFilterPrestation] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("reservations")
      .select("*, client:clients(prenom, nom), prestation:prestations(nom)")
      .order("date_rdv", { ascending: false });

    setReservations(
      (data || []).map((r: any) => ({
        ...r,
        client_name: `${r.client?.prenom || ""} ${r.client?.nom || ""}`.trim(),
        prestation_name: r.prestation?.nom || "",
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── KPIs ──
  const now = new Date();
  const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const prevMonth = new Date(now);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthStart = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}-01`;

  const thisMonthRes = reservations.filter(
    (r) => r.date_rdv >= currentMonthStart && r.statut !== "annulee"
  );
  const prevMonthRes = reservations.filter(
    (r) =>
      r.date_rdv >= prevMonthStart &&
      r.date_rdv < currentMonthStart &&
      r.statut !== "annulee"
  );

  const caThisMonth = thisMonthRes
    .filter((r) => r.acompte_paye)
    .reduce((s, r) => s + Number(r.montant_acompte || 0), 0);
  const caPrevMonth = prevMonthRes
    .filter((r) => r.acompte_paye)
    .reduce((s, r) => s + Number(r.montant_acompte || 0), 0);
  const caVariation =
    caPrevMonth > 0 ? ((caThisMonth - caPrevMonth) / caPrevMonth) * 100 : 0;

  const realisees = thisMonthRes.filter((r) => r.statut === "realisee");
  const nbRealisees = realisees.length;
  const panierMoyen = nbRealisees > 0 ? caThisMonth / nbRealisees : 0;

  const noShows = thisMonthRes.filter((r) => r.statut === "no_show").length;
  const tauxNoShow =
    thisMonthRes.length > 0
      ? ((noShows / thisMonthRes.length) * 100).toFixed(1)
      : "0";

  const acomptesEnAttente = reservations
    .filter(
      (r) =>
        r.statut === "confirmee" && !r.acompte_paye
    )
    .reduce((s, r) => s + Number(r.montant_acompte || 0), 0);

  // ── Graphique CA mensuel (6 mois) ──
  const caParMois = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const offset = 5 - i;
      const { start, end } = monthRange(offset);
      const ca = reservations
        .filter(
          (r) =>
            r.date_rdv >= start &&
            r.date_rdv < end &&
            r.acompte_paye &&
            r.statut !== "annulee"
        )
        .reduce((s, r) => s + Number(r.montant_acompte || 0), 0);
      return { name: monthLabel(offset), ca: Math.round(ca * 100) / 100 };
    });
  }, [reservations]);

  // ── Répartition CA par prestation ──
  const caParPrestation = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reservations.filter(
      (r) => r.acompte_paye && r.statut !== "annulee"
    )) {
      const name = r.prestation_name || "Autre";
      map.set(name, (map.get(name) || 0) + Number(r.montant_acompte || 0));
    }
    return Array.from(map, ([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [reservations]);

  // ── RDV par semaine (8 dernières semaines) ──
  const rdvParSemaine = useMemo(() => {
    const weeks: { name: string; rdv: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay() + 1 - i * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      const count = reservations.filter(
        (r) => r.date_rdv >= startStr && r.date_rdv <= endStr && r.statut !== "annulee"
      ).length;
      weeks.push({
        name: `${start.getDate()}/${start.getMonth() + 1}`,
        rdv: count,
      });
    }
    return weeks;
  }, [reservations]);

  // ── Solde & encaissements ──
  const totalAcomptesStripe = reservations
    .filter((r) => r.acompte_paye && r.statut !== "annulee")
    .reduce((s, r) => s + Number(r.montant_acompte || 0), 0);

  const totalResteSurPlace = reservations
    .filter((r) => r.statut === "realisee")
    .reduce((s, r) => s + (Number(r.montant_total || 0) - Number(r.montant_acompte || 0)), 0);

  const caReel = totalAcomptesStripe + totalResteSurPlace;

  const caParPrestationDetail = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reservations.filter((r) => r.statut === "realisee")) {
      const name = r.prestation_name || "Autre";
      map.set(name, (map.get(name) || 0) + Number(r.montant_total || 0));
    }
    return Array.from(map, ([name, total]) => ({ name, total }));
  }, [reservations]);

  // ── Annulations avec acompte conservé ──
  const annulationsAcompte = reservations.filter(
    (r) => r.statut === "annulee" && r.acompte_paye
  );
  const totalAcomptesConserves = annulationsAcompte.reduce(
    (s, r) => s + Number(r.montant_acompte || 0),
    0
  );

  // ── Alertes ──
  const alertesSansAcompte = reservations.filter((r) => {
    if (r.statut !== "en_attente" || r.acompte_paye) return false;
    const created = new Date(r.created_at);
    return now.getTime() - created.getTime() > 24 * 60 * 60 * 1000;
  });

  const alertesNonRealisees = reservations.filter((r) => {
    if (r.statut !== "confirmee") return false;
    return r.date_rdv < now.toISOString().split("T")[0];
  });

  // ── Tableau filtré ──
  const filtered = reservations.filter((r) => {
    if (filterMonth && !r.date_rdv.startsWith(filterMonth)) return false;
    if (filterPrestation && r.prestation_name !== filterPrestation) return false;
    if (filterStatut === "paye" && !r.acompte_paye) return false;
    if (filterStatut === "en_attente" && r.acompte_paye) return false;
    if (filterStatut === "rembourse" && r.statut !== "annulee") return false;
    return true;
  });

  function exportCSV() {
    const header = "Date,Cliente,Prestation,Montant total,Acompte,Reste,Mode paiement,Statut\n";
    const rows = filtered
      .map(
        (r) =>
          `${r.date_rdv},"${r.client_name}","${r.prestation_name}",${Number(r.montant_total).toFixed(2)},${Number(r.montant_acompte).toFixed(2)},${(Number(r.montant_total) - Number(r.montant_acompte)).toFixed(2)},${r.stripe_payment_id ? "Stripe" : "Sur place"},${r.statut}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naea-finance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const prestationNames = [...new Set(reservations.map((r) => r.prestation_name))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Finance</h2>

      {/* ── KPIs ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KPI
          label="CA du mois"
          value={fmt(caThisMonth)}
          sub={
            caVariation !== 0
              ? `${caVariation > 0 ? "+" : ""}${caVariation.toFixed(1)} % vs mois précédent`
              : undefined
          }
          subColor={caVariation >= 0 ? "text-green-600" : "text-red-600"}
          icon={Euro}
          color="text-green-700 bg-green-50"
        />
        <KPI
          label="CA mois précédent"
          value={fmt(caPrevMonth)}
          icon={TrendingDown}
          color="text-gray-600 bg-gray-100"
        />
        <KPI
          label="Prestations réalisées"
          value={nbRealisees}
          icon={ShoppingBag}
          color="text-blue-700 bg-blue-50"
        />
        <KPI
          label="Panier moyen"
          value={fmt(panierMoyen)}
          icon={TrendingUp}
          color="text-bordeaux-700 bg-bordeaux-50"
        />
        <KPI
          label="Taux de no-show"
          value={`${tauxNoShow} %`}
          icon={Ban}
          color="text-red-700 bg-red-50"
        />
        <KPI
          label="Acomptes en attente"
          value={fmt(acomptesEnAttente)}
          icon={AlertTriangle}
          color="text-amber-700 bg-amber-50"
        />
      </div>

      {/* ── Graphiques ── */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* CA mensuel */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 xl:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            CA mensuel (6 derniers mois)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={caParMois}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(v) => fmt(Number(v))}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey="ca" fill="#6e1f3c" radius={[4, 4, 0, 0]} name="CA" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par prestation */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            CA par prestation
          </h3>
          {caParPrestation.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Pas de données</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={caParPrestation}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {caParPrestation.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {caParPrestation.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1 text-xs text-gray-600">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* RDV par semaine */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          RDV par semaine (8 dernières semaines)
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rdvParSemaine}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="rdv"
              stroke="#c9a961"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="RDV"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Solde & Encaissements ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">
            Solde & Encaissements
          </h3>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Total acomptes (Stripe)
            </p>
            <p className="text-lg font-bold text-gray-900">
              {fmt(totalAcomptesStripe)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Reste encaissé sur place
            </p>
            <p className="text-lg font-bold text-gray-900">
              {fmt(totalResteSurPlace)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">CA réel total</p>
            <p className="text-lg font-bold text-green-700">{fmt(caReel)}</p>
          </div>
        </div>
        {caParPrestationDetail.length > 0 && (
          <div className="border-t border-gray-50 px-5 py-4">
            <p className="mb-2 text-xs font-medium text-gray-500">
              Par prestation (réalisées)
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              {caParPrestationDetail.map((p) => (
                <span key={p.name} className="text-gray-700">
                  <span className="font-medium">{p.name}</span> : {fmt(p.total)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Acomptes non-remboursables ── */}
      {annulationsAcompte.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold text-gray-900">
              Acomptes conservés sur annulations
            </h3>
            <p className="text-xs text-gray-500">
              Total : {fmt(totalAcomptesConserves)}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Prestation</th>
                  <th className="px-5 py-3">Montant gardé</th>
                </tr>
              </thead>
              <tbody>
                {annulationsAcompte.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 last:border-0">
                    <td className="whitespace-nowrap px-5 py-3 text-gray-700">
                      {new Date(r.date_rdv).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3 text-gray-900">{r.client_name}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {r.prestation_name}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {fmt(Number(r.montant_acompte))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Alertes ── */}
      {(alertesSansAcompte.length > 0 || alertesNonRealisees.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Alertes</h3>
          {alertesSansAcompte.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-800">
                <AlertTriangle size={16} />
                Réservations sans acompte depuis +24h ({alertesSansAcompte.length})
              </p>
              <ul className="space-y-1 text-sm text-amber-700">
                {alertesSansAcompte.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    {r.client_name} — {r.prestation_name} —{" "}
                    {new Date(r.date_rdv).toLocaleDateString("fr-FR")}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {alertesNonRealisees.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-red-800">
                <AlertTriangle size={16} />
                Prestations passées non marquées réalisées ({alertesNonRealisees.length})
              </p>
              <ul className="space-y-1 text-sm text-red-700">
                {alertesNonRealisees.slice(0, 5).map((r) => (
                  <li key={r.id}>
                    {r.client_name} — {r.prestation_name} —{" "}
                    {new Date(r.date_rdv).toLocaleDateString("fr-FR")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Tableau des transactions ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold text-gray-900">Transactions</h3>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download size={14} />
            Exporter CSV
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 border-b border-gray-50 px-5 py-3">
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <select
            value={filterPrestation}
            onChange={(e) => setFilterPrestation(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">Toutes les prestations</option>
            {prestationNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="paye">Payé</option>
            <option value="en_attente">En attente</option>
            <option value="rembourse">Remboursé / annulé</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Prestation</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Acompte</th>
                <th className="px-5 py-3">Reste</th>
                <th className="px-5 py-3">Paiement</th>
                <th className="px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                    Aucune transaction
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 text-gray-700">
                    {new Date(r.date_rdv).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3 text-gray-900">{r.client_name}</td>
                  <td className="px-5 py-3 text-gray-600">
                    {r.prestation_name}
                  </td>
                  <td className="px-5 py-3 text-gray-900">
                    {fmt(Number(r.montant_total))}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {fmt(Number(r.montant_acompte))}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {fmt(Number(r.montant_total) - Number(r.montant_acompte))}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {r.stripe_payment_id ? "Stripe" : "Sur place"}
                  </td>
                  <td className="px-5 py-3">
                    {r.acompte_paye ? (
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Payé
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        En attente
                      </span>
                    )}
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

// ── Composant KPI réutilisable ──
function KPI({
  label,
  value,
  sub,
  subColor,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {sub && (
            <p className={`text-xs ${subColor || "text-gray-400"}`}>{sub}</p>
          )}
        </div>
      </div>
    </div>
  );
}
