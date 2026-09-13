import React from "react";
import { LayoutDashboard, Scissors, ShoppingBag, Users, MessageCircle, GitCompare, FlaskConical } from "lucide-react";
import { ActiveTab } from "../../types";

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  counts?: {
    services?: number;
    tickets?: number;
    staff?: number;
    clients?: number;
    gonzales?: number;
  };
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange, counts }) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: "executive",
      label: "Resumen Ejecutivo 360°",
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: "benchmark",
      label: "Benchmark Multi-Sede",
      icon: <GitCompare className="w-4 h-4 text-amber-500" />,
      badge: "RD • Luxury • Gonzales"
    },
    {
      id: "operations",
      label: "Operaciones & Demanda",
      icon: <Scissors className="w-4 h-4" />,
      badge: counts?.services ? `${counts.services}` : undefined
    },
    {
      id: "retail",
      label: "Ventas Retail & Kardex",
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: counts?.tickets ? `${counts.tickets}` : undefined
    },
    {
      id: "staff",
      label: "Colaboradores 360° & Ficha",
      icon: <Users className="w-4 h-4" />,
      badge: counts?.staff ? `${counts.staff}` : undefined
    },
    {
      id: "clients",
      label: "Clientes & Fidelidad",
      icon: <MessageCircle className="w-4 h-4" />,
      badge: counts?.clients ? `${counts.clients}` : undefined
    },
    {
      id: "supplies",
      label: "Insumos & Lab",
      icon: <FlaskConical className="w-4 h-4 text-violet-500" />,
      badge: "99.2K"
    }
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-print">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white/70 border border-slate-200/70"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
