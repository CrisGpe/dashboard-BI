import React, { useState, useEffect } from "react";
import { X, Save, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Building2, Store, Sparkles, FlaskConical } from "lucide-react";
import { SheetIdsConfig } from "../../types";
import { getSheetSettings, updateSheetSettings } from "../../services/api";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onConfigSaved }) => {
  const [adminId, setAdminId] = useState("");
  const [recId, setRecId] = useState("");
  const [erpId, setErpId] = useState("");
  const [ventasCajaId, setVentasCajaId] = useState("");
  const [gonzalesId, setGonzalesId] = useState("");
  const [luxuryId, setLuxuryId] = useState("");
  const [glossId, setGlossId] = useState("");
  const [despachosId, setDespachosId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getSheetSettings()
        .then((cfg: SheetIdsConfig) => {
          setAdminId(cfg.adminSheetId);
          setRecId(cfg.recepcionSheetId);
          setErpId(cfg.erpSheetId);
          setVentasCajaId(cfg.ventasCajaSheetId || "");
          setGonzalesId(cfg.gonzalesSheetId || "");
          setLuxuryId(cfg.luxurySheetId || "");
          setGlossId(cfg.glossSheetId || "1SXuedQigLxVUF2oxn65wEZ5-HnDDiVdy7lY7HaweVC4");
          setDespachosId(cfg.despachosSheetId || "1Rj1eexlnPcTPScIAoyew4vvFgs3DhiTt97iHL7S45_M");
        })
        .catch((err) => {
          console.error("Error loading settings:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      await updateSheetSettings({
        adminSheetId: adminId,
        recepcionSheetId: recId,
        erpSheetId: erpId,
        ventasCajaSheetId: ventasCajaId,
        gonzalesSheetId: gonzalesId,
        luxurySheetId: luxuryId,
        glossSheetId: glossId,
        despachosSheetId: despachosId
      });
      setStatusMsg({ type: "success", text: "¡Configuración guardada y sincronizada correctamente!" });
      setTimeout(() => {
        onConfigSaved();
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Error al actualizar configuración" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Configuración de Fuentes Google Sheets</h2>
            <p className="text-xs text-slate-500">
              Gestión centralizada de las 7 fuentes de Google Drive agrupadas por salón/sede
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                statusMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECCIÓN 1: SEDE GONZALES RD (Salón Principal - 4 Fuentes)                 */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100/80">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-600 text-white shadow-xs">
                  <Building2 className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Sede Gonzales RD (Salón Principal)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Operación integral con módulo OATC, ERP VentaRD y Caja 2025
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200/60">
                4 Fuentes
              </span>
            </div>

            <div className="space-y-3.5 pl-0.5">
              {/* Sheet 1: Admin */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    1. Registros Admin (Agentes & Liquidaciones)
                  </label>
                  {adminId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${adminId}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Abrir <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/... o ID"
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  disabled={loading || saving}
                />
                <p className="text-[11px] text-slate-400">Pestañas utilizadas: Agentes, Pendientes_Liquidacion</p>
              </div>

              {/* Sheet 2: Recepcion */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    2. Registros de Recepción (OATC, Borrador & Asistencia)
                  </label>
                  {recId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${recId}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Abrir <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={recId}
                  onChange={(e) => setRecId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/... o ID"
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  disabled={loading || saving}
                />
                <p className="text-[11px] text-slate-400">Pestañas utilizadas: OATC, Borrador, Asistencia</p>
              </div>

              {/* Sheet 3: ERP */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    3. Registros ERP VentaRD (Tickets, Detalle & Kardex)
                  </label>
                  {erpId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${erpId}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Abrir <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={erpId}
                  onChange={(e) => setErpId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/... o ID"
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  disabled={loading || saving}
                />
                <p className="text-[11px] text-slate-400">Pestañas utilizadas: Ventas_Tickets, Ventas_Detalle, Kardex_Movimientos</p>
              </div>

              {/* Sheet 4: Ventas 2025 (Caja) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    4. Ventas 2025 (Registro ventas caja)
                  </label>
                  {ventasCajaId && (
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${ventasCajaId}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Abrir <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={ventasCajaId}
                  onChange={(e) => setVentasCajaId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/... o ID"
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  disabled={loading || saving}
                />
                <p className="text-[11px] text-slate-400">Pestaña utilizada: Registro ventas caja (Facturación y comisiones reales)</p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 2: SEDE GONZALES AM (Venta Directa - 1 Fuente)                    */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-600 text-white shadow-xs">
                  <Store className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Sede Gonzales AM
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Punto de venta directo en caja (sin módulo digital de recepción)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60">
                1 Fuente
              </span>
            </div>

            <div className="space-y-1 pl-0.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  5. Ventas Sede Gonzales AM (Sin módulo recepción)
                </label>
                {gonzalesId && (
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${gonzalesId}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    Abrir <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={gonzalesId}
                onChange={(e) => setGonzalesId(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... o ID"
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                disabled={loading || saving}
              />
              <p className="text-[11px] text-slate-400">Pestaña utilizada: Hoja1 (Ventas directas de caja, 7,279 transacciones)</p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 3: SEDE LUXURY RD (Libro Integral Multi-Pestaña - 1 Archivo)       */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-purple-200/80 bg-purple-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-purple-600 text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Sede Luxury RD
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Libro maestro multi-pestaña: Ventas, OATC, Asistencia, Agentes y Clientes CRM
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200/60">
                Libro Integral (5 Pestañas)
              </span>
            </div>

            <div className="space-y-1 pl-0.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  6. Sede Luxury RD (Ventas 2026, OATC, Asistencia, Agentes & Clientes)
                </label>
                {luxuryId && (
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${luxuryId}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    Abrir <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={luxuryId}
                onChange={(e) => setLuxuryId(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... o ID"
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                disabled={loading || saving}
              />
              <p className="text-[11px] text-slate-400">
                Pestañas utilizadas: Ventas 2026 al 10.09 (11,538 filas), OATC (6,676 check-ins), Asistencia, Agentes y Clientes
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 4: SEDE GLOSS SALON (Libro Integral Multi-Pestaña - 1 Archivo)    */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-pink-200/80 bg-pink-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-pink-200/60">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-pink-600 text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Sede Gloss Salon
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Libro maestro multi-pestaña: Agentes, Clientes CRM, Borrador, OATC, Asistencia y Ventas
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200/60">
                Libro Integral (6 Pestañas)
              </span>
            </div>

            <div className="space-y-1 pl-0.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  7. Sede Gloss Salon (Agentes, Clientes, Borrador, OATC, Asistencia & Ventas)
                </label>
                {glossId && (
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${glossId}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-pink-600 hover:text-pink-800 flex items-center gap-1"
                  >
                    Abrir <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={glossId}
                onChange={(e) => setGlossId(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... o ID"
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 bg-white"
                disabled={loading || saving}
              />
              <p className="text-[11px] text-slate-400">
                Pestañas utilizadas: Agentes (16 colaboradores), Clientes (178), Borrador, OATC (6,636 check-ins), Asistencia (2,650) y Ventas 2026 del 01 al 09
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 5: INSUMOS & LABORATORIO TÉCNICO (SEDE GONZALES RD)               */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-violet-200/80 bg-violet-50/30 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-violet-200/60">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-violet-600 text-white shadow-xs">
                  <FlaskConical className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Insumos & Laboratorio Técnico (Sede Gonzales RD)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Módulo de auditoría de tintes, peróxidos y tratamientos perteneciente a Gonzales RD
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200/60">
                Sede Gonzales RD
              </span>
            </div>

            <div className="space-y-1.5 pl-0.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  8. Despacho de Insumos & Laboratorio (Gonzales RD)
                </label>
                {despachosId && (
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${despachosId}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1"
                  >
                    Abrir <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="text"
                value={despachosId}
                onChange={(e) => setDespachosId(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/... o ID"
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white"
                disabled={loading || saving}
              />
              <p className="text-[11px] text-slate-400">
                Pestaña utilizada: "Despacho de insumos" (~100,000 registros históricos 2022-2026 de tintes, peróxidos y tratamientos)
              </p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/80 text-[12px] text-amber-800">
            💡 <strong>Acceso Público:</strong> Asegúrate de que los enlaces de Google Drive estén configurados como <em>"Cualquier persona con el enlace puede ver"</em> para una sincronización en vivo sin fricción.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Guardando y Actualizando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Guardar y Sincronizar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
