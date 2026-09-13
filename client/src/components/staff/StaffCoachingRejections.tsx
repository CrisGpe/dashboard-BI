import React from "react";
import {
  Target,
  Award,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  ChevronDown,
  ChevronUp,
  Quote
} from "lucide-react";
import { OatcRecord } from "../../types";
import { formatDate } from "../../utils/formatters";

interface CancellationStats {
  totalCancelados: number;
  rechazosReales: number;
  erroresRegistro: number;
  atencionesConcretadas: number;
  totalDemandaReal: number;
  ratioBateo: number;
  subcategories: {
    precio: number;
    desistimiento: number;
    espera: number;
    insumo: number;
    preferencia: number;
    admin: number;
    otro: number;
  };
}

interface SedeBattingStats {
  ratioBateo: number;
  concretadas: number;
  rechazos: number;
}

interface StaffCoachingRejectionsProps {
  periodLabel: string;
  salon: string;
  cancellationStats: CancellationStats;
  sedeBattingStats: SedeBattingStats;
  filteredRejections: OatcRecord[];
  showRejectionAudit: boolean;
  onToggleRejectionAudit: () => void;
  rejectionFilterCategory: string;
  onFilterCategoryChange: (cat: string) => void;
  onAppendCoachingAgreement: (text: string) => void;
}

export const StaffCoachingRejections: React.FC<StaffCoachingRejectionsProps> = ({
  periodLabel,
  salon,
  cancellationStats,
  sedeBattingStats,
  filteredRejections,
  showRejectionAudit,
  onToggleRejectionAudit,
  rejectionFilterCategory,
  onFilterCategoryChange,
  onAppendCoachingAgreement
}) => {
  const diff = Math.round((cancellationStats.ratioBateo - sedeBattingStats.ratioBateo) * 10) / 10;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Bloque 4: Sesión de Coaching 1-a-1: Ratio de Bateo & Análisis de Rechazos ("Data Dura")
            </h2>
            <p className="text-[11px] text-slate-500">
              Conversión comercial de consultas y diagnóstico de oportunidades perdidas registradas en recepción
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-500">Corte:</span>
          <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
            {periodLabel}
          </span>
        </div>
      </div>

      {/* 4 Spotlight KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Ratio de Bateo Individual */}
        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 print:border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Ratio de Bateo Individual
            </span>
            <Award className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {cancellationStats.ratioBateo}%
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                cancellationStats.ratioBateo >= 90
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : cancellationStats.ratioBateo >= 75
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {cancellationStats.ratioBateo >= 90
                ? "Excelente Cierre"
                : cancellationStats.ratioBateo >= 75
                ? "Oportunidad de Cierre"
                : "Fuga Crítica"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {cancellationStats.atencionesConcretadas} de {cancellationStats.totalDemandaReal} consultas concretadas en este periodo
          </p>
        </div>

        {/* 2. Benchmark de Sede */}
        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 print:border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Benchmark Sede ({salon})
            </span>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {sedeBattingStats.ratioBateo}%
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-0.5 ${
                diff >= 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {diff >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {diff >= 0 ? `+${diff}%` : `${diff}%`} vs Sede
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Promedio de efectividad comercial en {salon}
          </p>
        </div>

        {/* 3. Rechazos Reales de Clientes */}
        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 print:border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Rechazos Reales (Fuga)
            </span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {cancellationStats.rechazosReales}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Clientes que cotizaron o esperaron pero no cerraron el servicio
          </p>
        </div>

        {/* 4. Errores de Registro Descartados */}
        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/60 print:border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between text-slate-600 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Errores de Tipeo (Recepción)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-700">
              {cancellationStats.erroresRegistro}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Excluidos 100%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Duplicados o errores administrativos (no afectan al colaborador)
          </p>
        </div>
      </div>

      {/* Clinical Diagnostic Grid */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Diagnóstico Clínico de Objeciones y Rechazos ({periodLabel})
            </h3>
            <p className="text-[11px] text-slate-500">
              Analiza con el colaborador las causas documentadas por recepción para acordar planes de acción
            </p>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60 self-start sm:self-auto">
            Total consultas evaluadas: {cancellationStats.totalDemandaReal}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Precio */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  🏷️ Objeción Precio
                </span>
                <span className="font-black text-xs px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
                  {cancellationStats.subcategories.precio} casos
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Clientas que manifestaron <em>"muy caro"</em> o <em>"buscaré dinero"</em> tras la cotización en sillón.
              </p>
            </div>
            <div className="pt-2 border-t border-amber-200/60 space-y-2">
              <div className="text-[10px] text-amber-900 font-medium">
                💡 <strong>Tip de Coaching:</strong> Trabajar la técnica de anclaje de valor y ofrecer opciones de tratamiento por fases o financiamiento.
              </div>
              <button
                onClick={() =>
                  onAppendCoachingAgreement(
                    "Compromiso Comercial: Manejo de objeción de precio explicando los beneficios y duración del producto antes de dar el presupuesto final."
                  )
                }
                className="w-full text-center text-[10px] font-bold text-amber-900 bg-white hover:bg-amber-100 py-1.5 px-2 rounded-lg border border-amber-300 transition-colors shadow-2xs no-print cursor-pointer"
              >
                + Insertar en Acuerdos
              </button>
            </div>
          </div>

          {/* 2. Espera */}
          <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200/70 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1">
                  ⌛ Tiempos de Espera
                </span>
                <span className="font-black text-xs px-2 py-0.5 rounded-full bg-sky-200/60 text-sky-900">
                  {cancellationStats.subcategories.espera} casos
                </span>
              </div>
              <p className="text-[11px] text-sky-800 leading-relaxed">
                Clientas que se retiraron por retrasos en el inicio del servicio o acumulación en sala de espera.
              </p>
            </div>
            <div className="pt-2 border-t border-sky-200/60 space-y-2">
              <div className="text-[10px] text-sky-900 font-medium">
                💡 <strong>Tip de Coaching:</strong> Alertar a recepción con 15 minutos de anticipación si el servicio anterior se alarga para ofrecer bebida de cortesía.
              </div>
              <button
                onClick={() =>
                  onAppendCoachingAgreement(
                    "Compromiso de Gestión de Tiempos: Coordinación proactiva con recepción en turnos consecutivos para reducir esperas mayores a 15 min."
                  )
                }
                className="w-full text-center text-[10px] font-bold text-sky-900 bg-white hover:bg-sky-100 py-1.5 px-2 rounded-lg border border-sky-300 transition-colors shadow-2xs no-print cursor-pointer"
              >
                + Insertar en Acuerdos
              </button>
            </div>
          </div>

          {/* 3. Desistimiento */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/70 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
                  🤔 Desistimiento / Duda
                </span>
                <span className="font-black text-xs px-2 py-0.5 rounded-full bg-purple-200/60 text-purple-900">
                  {cancellationStats.subcategories.desistimiento} casos
                </span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Clientas que acudieron a consultar pero <em>"no se convencieron"</em> o manifestaron que <em>"lo pensarán"</em>.
              </p>
            </div>
            <div className="pt-2 border-t border-purple-200/60 space-y-2">
              <div className="text-[10px] text-purple-900 font-medium">
                💡 <strong>Tip de Coaching:</strong> Potenciar la consulta de diagnóstico visual mostrando fotos de resultados previos en cabellos similares.
              </div>
              <button
                onClick={() =>
                  onAppendCoachingAgreement(
                    "Compromiso de Consulta Consultiva: Uso de catálogo visual y diagnóstico capilar guiado para transmitir seguridad y cerrar citas dudosas."
                  )
                }
                className="w-full text-center text-[10px] font-bold text-purple-900 bg-white hover:bg-purple-100 py-1.5 px-2 rounded-lg border border-purple-300 transition-colors shadow-2xs no-print cursor-pointer"
              >
                + Insertar en Acuerdos
              </button>
            </div>
          </div>

          {/* 4. Insumo / Disponibilidad */}
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/70 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1">
                  📦 Falta de Insumo
                </span>
                <span className="font-black text-xs px-2 py-0.5 rounded-full bg-rose-200/60 text-rose-900">
                  {cancellationStats.subcategories.insumo} casos
                </span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Pérdida de servicios por falta de stock de tono de tinte, tipo de prótesis o producto cosmético.
              </p>
            </div>
            <div className="pt-2 border-t border-rose-200/60 space-y-2">
              <div className="text-[10px] text-rose-900 font-medium">
                💡 <strong>Gestión Operativa:</strong> Responsabilidad compartida con almacén para verificar insumos críticos al inicio de la jornada.
              </div>
              <button
                onClick={() =>
                  onAppendCoachingAgreement(
                    "Alerta de Abastecimiento: Notificar quiebres de insumos críticos al inicio del turno para evitar cancelaciones operativas."
                  )
                }
                className="w-full text-center text-[10px] font-bold text-rose-900 bg-white hover:bg-rose-100 py-1.5 px-2 rounded-lg border border-rose-300 transition-colors shadow-2xs no-print cursor-pointer"
              >
                + Insertar en Acuerdos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Case-by-Case Audit Table */}
      <div className="bg-slate-50/70 rounded-2xl border border-slate-200/70 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Auditoría Detallada Caso por Caso ({cancellationStats.totalCancelados} registros)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Notas Literales de Recepción
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Despliega la bitácora exacta de comentarios redactados por recepción en OATC y Borrador para revisar casos puntuales con el colaborador
            </p>
          </div>

          <button
            onClick={onToggleRejectionAudit}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            {showRejectionAudit ? (
              <>
                <ChevronUp className="w-4 h-4 text-indigo-600" />
                <span>Ocultar Bitácora</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-indigo-600" />
                <span>Ver Bitácora Caso por Caso ({cancellationStats.totalCancelados})</span>
              </>
            )}
          </button>
        </div>

        {showRejectionAudit && (
          <div className="space-y-3 pt-3 border-t border-slate-200/80 animate-in fade-in duration-200">
            {/* Filter pill bar */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Filtrar:</span>
              {[
                { id: "ALL", label: `Todos (${cancellationStats.totalCancelados})` },
                { id: "RECHAZO_CLIENTE", label: `Rechazos Reales (${cancellationStats.rechazosReales})` },
                { id: "PRECIO", label: `Precio (${cancellationStats.subcategories.precio})` },
                { id: "ESPERA", label: `Espera (${cancellationStats.subcategories.espera})` },
                { id: "DESISTIMIENTO", label: `Desistimiento (${cancellationStats.subcategories.desistimiento})` },
                { id: "INSUMO", label: `Insumo (${cancellationStats.subcategories.insumo})` },
                { id: "ERROR_REGISTRO", label: `Errores Registro (${cancellationStats.erroresRegistro})` }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onFilterCategoryChange(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    rejectionFilterCategory === f.id
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-xs text-left table-dense">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">OATC / Fecha</th>
                      <th className="px-3 py-2.5">Día y Hora</th>
                      <th className="px-3 py-2.5">Cliente</th>
                      <th className="px-3 py-2.5">Servicio Solicitado</th>
                      <th className="px-3 py-2.5">Clasificación</th>
                      <th className="px-3 py-2.5">Nota Literal de Recepción (Verbatim)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRejections.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                          No hay registros que coincidan con el filtro seleccionado en este periodo.
                        </td>
                      </tr>
                    ) : (
                      filteredRejections.map((rec, idx) => (
                        <tr key={`${rec.numeroOatc}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3 py-2 font-mono text-[11px] font-bold text-slate-800 whitespace-nowrap">
                            <div>#{rec.numeroOatc || idx + 1}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {rec.fechaRegistro ? formatDate(rec.fechaRegistro) : "-"}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-slate-600 text-[11px] whitespace-nowrap">
                            <div className="font-semibold text-slate-700">{rec.diaSemana || "Día"}</div>
                            <div className="text-[10px] text-slate-400">
                              {rec.horaCancelacion || rec.hrRegistro || "Sin hora"}
                            </div>
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-800 max-w-[140px] truncate">
                            {rec.clienteNombre || "Cliente"}
                          </td>
                          <td className="px-3 py-2 text-slate-700 font-medium max-w-[150px] truncate">
                            {rec.tipoOatc || "Servicio"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                  rec.macroCategoria === "RECHAZO_CLIENTE"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {rec.macroCategoria === "RECHAZO_CLIENTE" ? "RECHAZO REAL" : "ERROR REGISTRO"}
                              </span>
                              {rec.subCategoria && (
                                <span className="text-[10px] font-semibold text-slate-500">
                                  {rec.subCategoria}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-slate-700">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] leading-relaxed font-sans text-slate-800 flex items-start gap-1.5">
                              <Quote className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                              <span className="italic">
                                "{rec.motivoLimpio || rec.motivo || "Sin nota especificada"}"
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
