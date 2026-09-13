import React from "react";
import { AlertTriangle, Info, Database, Layers, ArrowRight } from "lucide-react";

export interface DataAvailabilityNoticeProps {
  tipo: "PENDIENTE_CARGA" | "NO_IMPLEMENTADO" | "CENTRALIZADO";
  titulo: string;
  mensaje: string;
  modulo: string;
  salonNombre?: string;
  accionSugerida?: string;
  onActionClick?: () => void;
  actionText?: string;
  className?: string;
}

export const DataAvailabilityNotice: React.FC<DataAvailabilityNoticeProps> = ({
  tipo,
  titulo,
  mensaje,
  modulo,
  salonNombre,
  accionSugerida,
  onActionClick,
  actionText,
  className = ""
}) => {
  const getTheme = () => {
    switch (tipo) {
      case "PENDIENTE_CARGA":
        return {
          container: "bg-amber-50/80 border-amber-200 text-amber-900",
          badge: "bg-amber-100 text-amber-800 border-amber-300",
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          label: "Pendiente de Carga"
        };
      case "NO_IMPLEMENTADO":
        return {
          container: "bg-rose-50/70 border-rose-200 text-rose-900",
          badge: "bg-rose-100 text-rose-800 border-rose-300",
          icon: <Layers className="w-5 h-5 text-rose-500 shrink-0" />,
          label: "Sin Módulo Digital"
        };
      case "CENTRALIZADO":
      default:
        return {
          container: "bg-indigo-50/70 border-indigo-200 text-indigo-950",
          badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
          icon: <Database className="w-5 h-5 text-indigo-600 shrink-0" />,
          label: "Gestión Centralizada"
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs relative overflow-hidden transition-all ${theme.container} ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5 sm:mt-0 p-2 rounded-xl bg-white shadow-2xs border border-white/60">
            {theme.icon}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badge}`}>
                {theme.label}
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Módulo: <strong>{modulo}</strong>
              </span>
              {salonNombre && (
                <span className="text-[11px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60">
                  {salonNombre}
                </span>
              )}
            </div>
            <h4 className="text-sm font-black tracking-tight text-slate-900">
              {titulo}
            </h4>
            <p className="text-xs leading-relaxed text-slate-600 max-w-3xl">
              {mensaje}
            </p>
            {accionSugerida && (
              <p className="text-[11px] font-medium text-slate-500 pt-0.5">
                💡 <em>{accionSugerida}</em>
              </p>
            )}
          </div>
        </div>

        {onActionClick && actionText && (
          <button
            onClick={onActionClick}
            className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
