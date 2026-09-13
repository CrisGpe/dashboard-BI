import React, { useState } from "react";
import { useDashboardData } from "./hooks/useDashboardData";
import { useFilteredData } from "./hooks/useFilteredData";
import { Header } from "./components/navbar/Header";
import { TabNavigation } from "./components/navbar/TabNavigation";
import { FilterBar } from "./components/navbar/FilterBar";
import { SettingsModal } from "./components/navbar/SettingsModal";
import { ExecutiveView } from "./components/executive/ExecutiveView";
import { OperationsView } from "./components/operations/OperationsView";
import { RetailInventoryView } from "./components/retail/RetailInventoryView";
import { Staff360View } from "./components/staff/Staff360View";
import { ClientsLoyaltyView } from "./components/clients/ClientsLoyaltyView";
import { MultiBranchBenchmarkView } from "./components/benchmark/MultiBranchBenchmarkView";
import { SuppliesAnalysisView } from "./components/supplies/SuppliesAnalysisView";
import { ActiveTab } from "./types";
import { RefreshCw, AlertCircle } from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("executive");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const { data, loading, refreshing, error, refresh } = useDashboardData();
  const {
    filtered,
    selectedSalon,
    setSelectedSalon,
    selectedAgent,
    setSelectedAgent,
    staffList,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchTerm,
    setSearchTerm,
    clearFilters
  } = useFilteredData(data);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200 animate-bounce mb-4">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-lg font-black text-slate-800 tracking-tight">
          Cargando Dashboard Ejecutivo 360°...
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Descargando y cruzando en vivo los 3 archivos de Google Sheets (Admin, Recepción y ERP VentaRD)
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top App Header */}
      <Header
        data={data}
        refreshing={refreshing}
        onRefresh={refresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace */}
      <main className="dashboard-fluid py-5 flex-1">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={refresh}
              className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {data && filtered && (
          <>
            {/* View Switcher Tabs */}
            <div className="mb-4">
              <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={{
                  services: data.orders.length,
                  tickets: data.tickets.length,
                  staff: data.staff360.length,
                  clients: data.clients.length,
                  gonzales: data.gonzalesSales?.length
                }}
              />
            </div>

            {/* Filter Bar (Only on tabs that use it) */}
            {activeTab !== "staff" && activeTab !== "benchmark" && activeTab !== "supplies" && (
              <FilterBar
                staffList={staffList}
                selectedSalon={selectedSalon}
                onSelectSalon={setSelectedSalon}
                selectedAgent={selectedAgent}
                onSelectAgent={setSelectedAgent}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onClearFilters={clearFilters}
              />
            )}

            {/* Active View Container */}
            {activeTab === "benchmark" && (
              <MultiBranchBenchmarkView
                benchmark={data.multiBranchBenchmark}
                gonzalesSales={data.gonzalesSales}
              />
            )}

            {activeTab === "executive" && (
              <ExecutiveView
                data={data}
                dynamicKPIs={filtered.dynamicKPIs}
                selectedSalon={selectedSalon}
                salonBreakdown={filtered.salonBreakdown}
                onSelectSalon={setSelectedSalon}
                onNavigateTab={setActiveTab}
                onSelectAgent={setSelectedAgent}
              />
            )}

            {activeTab === "operations" && (
              <OperationsView
                orders={filtered.orders}
                attendance={filtered.attendance}
                cashServiceSales={filtered.cashServiceSales}
                serviceCategories={data.serviceCategoryRankings}
                searchTerm={searchTerm}
                selectedSalon={selectedSalon}
              />
            )}

            {activeTab === "retail" && (
              <RetailInventoryView
                tickets={filtered.tickets}
                ticketDetails={filtered.ticketDetails}
                kardex={filtered.kardex}
                productRankings={filtered.productRankings}
                brandMetrics={filtered.brandPortfolioMetrics}
                searchTerm={searchTerm}
                selectedSalon={selectedSalon}
              />
            )}

            {activeTab === "staff" && (
              <Staff360View
                staffList={staffList}
                selectedAgent={selectedAgent}
                onSelectAgent={setSelectedAgent}
                orders={data.orders}
                attendance={data.attendance}
                cashServiceSales={filtered.allUnifiedCashSales}
                serviceCategories={data.serviceCategoryRankings}
                tickets={filtered.allUnifiedTickets}
                ticketDetails={data.ticketDetails}
                clients={data.clients}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
              />
            )}

            {activeTab === "clients" && (
              <ClientsLoyaltyView
                clients={filtered.clients}
                searchTerm={searchTerm}
                selectedSalon={selectedSalon}
              />
            )}

            {activeTab === "supplies" && (
              <SuppliesAnalysisView />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-400 no-print">
        <div className="dashboard-fluid text-center">
          SaS Vaikuntha • Business Analytics 360° • Conexión multi-fuente optimizada
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={refresh}
      />
    </div>
  );
};
