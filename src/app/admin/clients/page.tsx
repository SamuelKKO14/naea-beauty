"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Search, X, ArrowLeft } from "lucide-react";
import type { Client, Reservation } from "@/lib/types";

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

type ClientRow = Client & { rdv_count: number; last_rdv: string | null };

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [clientReservations, setClientReservations] = useState<
    (Reservation & { prestation_name: string })[]
  >([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    // Fetch all clients with reservation counts
    const { data: clientsData } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!clientsData) {
      setClients([]);
      setLoading(false);
      return;
    }

    // Get reservation counts per client
    const { data: counts } = await supabase
      .from("reservations")
      .select("client_id, date_rdv")
      .order("date_rdv", { ascending: false });

    const countMap = new Map<string, { count: number; lastDate: string | null }>();
    for (const r of counts || []) {
      const existing = countMap.get(r.client_id);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(r.client_id, { count: 1, lastDate: r.date_rdv });
      }
    }

    setClients(
      clientsData.map((c) => ({
        ...c,
        rdv_count: countMap.get(c.id)?.count || 0,
        last_rdv: countMap.get(c.id)?.lastDate || null,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function openClient(client: ClientRow) {
    setSelectedClient(client);
    setLoadingDetail(true);
    const { data } = await supabase
      .from("reservations")
      .select("*, prestation:prestations(nom)")
      .eq("client_id", client.id)
      .order("date_rdv", { ascending: false });

    setClientReservations(
      (data || []).map((r: any) => ({
        ...r,
        prestation_name: r.prestation?.nom || "",
      }))
    );
    setLoadingDetail(false);
  }

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.prenom.toLowerCase().includes(q) ||
      c.nom.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  // Detail view
  if (selectedClient) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedClient(null)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Retour à la liste
        </button>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedClient.prenom} {selectedClient.nom}
          </h2>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <p>
              <span className="text-gray-500">Email :</span>{" "}
              {selectedClient.email}
            </p>
            <p>
              <span className="text-gray-500">Tél :</span>{" "}
              {selectedClient.telephone}
            </p>
            <p>
              <span className="text-gray-500">Depuis :</span>{" "}
              {new Date(selectedClient.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          {selectedClient.notes && (
            <p className="mt-3 text-sm text-gray-600">
              <span className="text-gray-500">Notes :</span>{" "}
              {selectedClient.notes}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold text-gray-900">
              Historique des réservations ({clientReservations.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Prestation</th>
                  <th className="px-5 py-3">Lieu</th>
                  <th className="px-5 py-3">Montant</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {loadingDetail && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                      Chargement…
                    </td>
                  </tr>
                )}
                {!loadingDetail && clientReservations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                      Aucune réservation
                    </td>
                  </tr>
                )}
                {clientReservations.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-gray-700">
                      {new Date(r.date_rdv).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3 text-gray-900">
                      {r.prestation_name}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {r.lieu === "chez_naea" ? "Chez Naéa" : "Domicile"}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {Number(r.montant_total).toFixed(2).replace(".", ",")} €
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[r.statut]}`}
                      >
                        {STATUT_LABELS[r.statut]}
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Clients</h2>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm"
        />
      </div>

      {/* Tableau */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-5 py-3">Prénom</th>
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Téléphone</th>
                <th className="px-5 py-3">RDV</th>
                <th className="px-5 py-3">Dernier RDV</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    Chargement…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    Aucun client trouvé
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openClient(c)}
                  className="cursor-pointer border-b border-gray-50 transition-colors hover:bg-gray-50 last:border-0"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {c.prenom}
                  </td>
                  <td className="px-5 py-3 text-gray-900">{c.nom}</td>
                  <td className="px-5 py-3 text-gray-600">{c.email}</td>
                  <td className="px-5 py-3 text-gray-600">{c.telephone}</td>
                  <td className="px-5 py-3 text-gray-700">{c.rdv_count}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                    {c.last_rdv
                      ? new Date(c.last_rdv).toLocaleDateString("fr-FR")
                      : "—"}
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
