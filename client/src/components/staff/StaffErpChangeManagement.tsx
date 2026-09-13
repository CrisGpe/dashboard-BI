import React from "react";
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, Save } from "lucide-react";

interface StaffErpChangeManagementProps {
  periodLabel: string;
  agentName: string;
  crossSellRate: number;
  crossSellTickets: number;
  agreementNotes: string;
  onAgreementNotesChange: (notes: string) => void;
  savedNotesStatus: boolean;
  onSaveNotes: () => void;
}

export const StaffErpChangeManagement: React.FC<StaffErpChangeManagementProps> = ({
  periodLabel,
  agentName,
  crossSellRate,
  crossSellTickets,
  agreementNotes,
  onAgreementNotesChange,
  savedNotesStatus,
  onSaveNotes
}) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <ShieldCheck className="w-5 h-5 text-violet-600" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Bloque 5: Diagnóstico de Gestión del Cambio (Google Sheets vs SaS Vaikuntha ERP)
        </h2>
      </div>

      {/* Pain Points vs ERP Solution Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pain 1: Tiempos Muertos */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> 1. Tiempos Muertos en Horas Valle
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Dolor Actual
            </span>
          </div>
          <p className="text-xs text-slate-600">
            <strong>En Google Sheets:</strong> Caída del 60% de ocupación entre 1:00 PM y 2:30 PM. El estilista espera pasivamente que entre público.
          </p>
          <div className="pt-2 border-t border-slate-200/80 text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
            <strong>Solución SaS Vaikuntha ERP:</strong> Dynamic Yield Management. La app ofrece promociones automáticas en horas valle para agendar clientas y elevar los ingresos por hora del colaborador a más de S/. 120/h.
          </div>
        </div>

        {/* Pain 2: Cross-Selling en 0% */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> 2. Cross-Selling en Mínimos ({crossSellRate}%)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Dolor Actual
            </span>
          </div>
          <p className="text-xs text-slate-600">
            <strong>En Google Sheets:</strong> En este corte solo {crossSellTickets} servicios incluyeron producto retail. El colaborador pierde hasta S/. 800 mensuales en comisiones retail.
          </p>
          <div className="pt-2 border-t border-slate-200/80 text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
            <strong>Solución SaS Vaikuntha ERP:</strong> Sugerencia de producto en el cobro. Al terminar un servicio de Cosmiatría o Colorimetría, el cajero ve el producto recomendado para ofrecerlo en el acto.
          </div>
        </div>

        {/* Pain 3: Fórmulas y Recetas en Papel */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> 3. Fórmulas Químicas y Preferencias en Memoria
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Dolor Actual
            </span>
          </div>
          <p className="text-xs text-slate-600">
            <strong>En Google Sheets:</strong> No existe registro de mezclas de tinte, tratamientos faciales ni sensibilidad del cliente.
          </p>
          <div className="pt-2 border-t border-slate-200/80 text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
            <strong>Solución SaS Vaikuntha ERP:</strong> Ficha Técnica Digital del Cliente. Historial de tonos, fórmulas y diagnósticos accesible desde el móvil del estilista en segundos.
          </div>
        </div>

        {/* Pain 4: Falta de Transparencia en Comisiones */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> 4. Incertidumbre y Desfase en Liquidaciones
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Dolor Actual
            </span>
          </div>
          <p className="text-xs text-slate-600">
            <strong>En Google Sheets:</strong> Comisiones calculadas al final del periodo sin visualización diaria para el trabajador.
          </p>
          <div className="pt-2 border-t border-slate-200/80 text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
            <strong>Solución SaS Vaikuntha ERP:</strong> Transparencia 100% en Móvil. El estilista consulta en tiempo real cuánto ha ganado en comisiones por cada servicio liquidado.
          </div>
        </div>
      </div>

      {/* Agreements and Notes Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            Acuerdos y Compromisos de la Entrevista 1-a-1 ({periodLabel})
          </h3>
          <div className="flex items-center gap-2 no-print">
            {savedNotesStatus && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Guardado en Laptop
              </span>
            )}
            <button
              onClick={onSaveNotes}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-indigo-200/60"
            >
              <Save className="w-3.5 h-3.5" /> Guardar Notas
            </button>
          </div>
        </div>

        <textarea
          value={agreementNotes}
          onChange={(e) => onAgreementNotesChange(e.target.value)}
          rows={4}
          placeholder="Registra aquí los compromisos pactados durante la reunión individual..."
          className="w-full text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 print:bg-white print:border-slate-300 print:text-black font-sans leading-relaxed"
        />
      </div>

      {/* Signatures for Print */}
      <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-xs text-slate-600">
        <div>
          <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
          <div className="font-bold text-slate-800">{agentName}</div>
          <div className="text-[10px] text-slate-500">Firma del Colaborador</div>
        </div>
        <div>
          <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
          <div className="font-bold text-slate-800">Dirección de Sede / Operaciones</div>
          <div className="text-[10px] text-slate-500">Firma y Sello SaS Vaikuntha</div>
        </div>
      </div>
    </div>
  );
};
