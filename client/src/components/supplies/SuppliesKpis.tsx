import React from "react";
import { FlaskConical, DollarSign, Users, Tag, CheckCircle2, AlertTriangle } from "lucide-react";
import { SuppliesDashboardResponse } from "../../types";

interface SuppliesKpisProps {
  data: SuppliesDashboardResponse;
}

export const SuppliesKpis: React.FC<SuppliesKpisProps> = ({ data }) => {
  const { kpis } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Despachos */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Despachos</span>
          <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl">
            <FlaskConical className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {kpis.totalDespachos.toLocaleString("es-PE")}
        </div>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-violet-500"></span>
          Histórico 2022 - 2026
        </p>
      </div>

      {/* 2. Costo Total Registrado */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo Registrado</span>
          <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-700 tracking-tight">
          S/ {kpis.totalCostoRegistrado.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-[11px] text-amber-600 mt-1 font-medium flex items-center gap-1" title="Solo el 43.9% de los registros históricos tienen costo especificado en Columna K">
          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
          Valorizado en 43.9% de filas
        </p>
      </div>

      {/* 3. Costo Promedio */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo Medio / Fila</span>
          <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          S/ {kpis.costoPromedioPorDespacho.toFixed(2)}
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Por insumo con costo
        </p>
      </div>

      {/* 4. Estilistas / Dependientes */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Colaboradores</span>
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {kpis.totalColaboradores}
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Estilistas & Asistentes
        </p>
      </div>

      {/* 5. Marcas e Insumos */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Marcas Activas</span>
          <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
            <Tag className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          {kpis.totalMarcas}
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          {kpis.totalTipos} tipos catalogados
        </p>
      </div>

      {/* 6. Tasa de Trazabilidad */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trazabilidad</span>
          <div className="p-2.5 bg-cyan-100 text-cyan-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-cyan-700 tracking-tight">
          {kpis.tasaConTrazabilidadPct}%
        </div>
        <p className="text-[11px] text-slate-500 mt-1 font-medium">
          {kpis.conOatcCount.toLocaleString("es-PE")} OATC | {kpis.conTicketCount.toLocaleString("es-PE")} Tkts
        </p>
      </div>
    </div>
  );
};
