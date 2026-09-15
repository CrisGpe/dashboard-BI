export interface AgentMaster {
  ficha: number;
  nombre: string;
  relacionLaboral: string;
  salon: string;
  hrEntrada: string;
  hrSalida: string;
  diaDescanso: string;
  estado: string;
  especialidad: string;
  dni?: string;
  celular?: string;
  genero?: string;
}

export interface SettlementRecord {
  idAutorizacion: string;
  fechaSolicitud: string;
  agente: string;
  rangoFechas: string;
  montoPagar: number;
  estado: "Pagado" | "Pendiente" | string;
  autorizadoPor: string;
  fechaPago?: string;
}

export type CancellationMacroCategory = "RECHAZO_CLIENTE" | "ERROR_REGISTRO";

export type CancellationSubCategory =
  | "PRECIO"
  | "ESPERA"
  | "DESISTIMIENTO"
  | "INSUMO"
  | "PREFERENCIA"
  | "ADMINISTRATIVO"
  | "OTRO";

export interface OatcRecord {
  id: string;
  hrRegistro: string;
  numeroOatc: number | string;
  tipoOatc: string;
  fechaRegistro: string;
  clienteNombre: string;
  tipoCliente: string;
  agente: string;
  sede?: string;
  diaSemana?: string; // Lunes, Martes, Miércoles, etc.
  horaResolucion?: string;
  motivo?: string;
  motivoLimpio?: string;
  isCancelled: boolean;
  horaCancelacion?: string;
  macroCategoria?: CancellationMacroCategory;
  subCategoria?: CancellationSubCategory;
  source: "OATC" | "Borrador";
}

export interface AttendanceRecord {
  id: string;
  fecha: string;
  dependiente: string;
  entrada: string;
  refI?: string;
  refT?: string;
  salida?: string;
  turnos: number;
  clientes: number;
  totalAtenciones: number;
  horasTrabajadas: number;
  sede?: string;
}

export interface TicketRecord {
  ticket: string;
  fecha: string;
  diaSemana?: string;
  cliente: string;
  clienteNombreLimpio: string;
  clienteDni?: string;
  clienteCelular?: string;
  asesor: string;
  subtotal: number;
  total: number;
  estado: string;
  metodoPago: string;
  tipoDoc: string;
  nroDoc: string;
  expectativas?: string;
  sede?: string;
  item?: string;
  cantidad?: number;
}

export interface TicketDetailRecord {
  id: string;
  ticket: string;
  fecha: string;
  diaSemana?: string;
  sku: string;
  producto: string;
  presentacion?: string;
  marca?: string;
  linea?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  costoUnitario?: number;
  margenSoles?: number;
}

export interface KardexRecord {
  idMovimiento: string;
  fechaHora: string;
  tipoMovimiento: string;
  sku: string;
  descripcion: string;
  cantidad: number;
  origen: string;
  destino: string;
  documentoRef?: string;
  costoUnitario: number;
}

export interface CashServiceSaleRecord {
  id: string;
  fecha: string;
  diaSemana?: string;
  ticketId: string;
  idOatc: number | string;
  cliente: string;
  agente: string;
  servicioOriginal: string;
  servicioFinal: string;
  servicioSubCategoria: string;
  servicioCategoria: string;
  montoEfectivo: number;
  montoTarjeta: number;
  montoDeposito: number;
  montoFinal: number;
  comision: number;
  estado: string;
  ruc: string;
  boleta: string;
  mes: string;
  anio: string;
  sede?: string;
}

export interface ServiceCategoryMetric {
  categoria: string;
  subcategoria: string;
  serviciosCount: number;
  facturacionTotal: number;
  comisionesTotal: number;
  margenSoles: number;
  margenPct: number;
}

export interface OatcCategoryMetric {
  categoria: string;
  demandaTotalOatc: number;        // Órdenes registradas en OATC / Borrador
  atencionesEfectivas: number;     // Órdenes no canceladas
  canceladasCount: number;         // Órdenes canceladas / rechazadas
  tasaCancelacionPct: number;      // % de fuga en recepción
  facturacionTotal: number;        // S/. cobrado en Caja
  comisionesTotal: number;         // S/. pagado a estilistas
  margenSoles: number;             // Facturación - Comisiones
  margenPct: number;               // Margen %
  ticketPromedio: number;          // Facturación / Atenciones Efectivas
}

export interface SpecificPortfolioItemMetric {
  id: string;
  nombre: string;
  tipo: "SERVICIO" | "PRODUCTO";
  categoriaPadre: string;          // Ej. Colorimetría, Kerastase, etc.
  volumen: number;                 // Cantidad de atenciones o unidades
  facturacionTotal: number;        // S/. recaudado
  comisionOCostoTotal: number;     // Comisión (servicios) o Costo (retail)
  margenSoles: number;
  margenPct: number;
  precioPromedio: number;
}

export interface Staff360 {
  agente: string;
  salon: string;
  especialidad: string;
  estado: string;
  hrEntrada?: string;
  hrSalida?: string;
  diaDescanso?: string;
  totalServicios: number;
  serviciosCancelados: number;
  rechazosReales: number;
  erroresRegistro: number;
  ratioBateo: number; // % éxito (atenciones / atenciones + rechazosReales)
  serviciosTop: { servicio: string; count: number }[];
  totalFacturadoServicios: number;
  totalComisionesServicios: number;
  ticketPromedioServicio: number;
  totalVentasRetail: number;
  cantidadProductosVendidos: number;
  ticketPromedioRetail: number;
  margenAportadoEmpresa: number;
  facturacionPorHora: number;
  totalLiquidado: number;
  totalPendienteLiquidacion: number;
  diasAsistidos: number;
  horasTotalesTrabajadas: number;
  serviciosPorHora: number;
  crossSellCount: number;
  crossSellRate: number;
}

export interface ProductCatalogRanking {
  sku: string;
  marca: string;
  linea: string;
  producto: string;
  presentacion?: string;
  unidadesVendidas: number;
  ticketsCount: number;
  ingresoTotal: number;
  precioPromedio: number;

  // Indicadores de Rotación y Comportamiento
  rotacionVelocidadDiaria: number; // Unidades vendidas / días activos
  penetracionTicketsPct: number;   // % de tickets donde figura
  clasificacionABC: "A" | "B" | "C"; // Pareto: A (Core 80%), B (15%), C (5%)
  horaPico: number;                // Hora pico (ej. 19)
  franjaPico: string;              // "MAÑANA" | "MEDIODIA" | "TARDE_NOCHE" | "NOCHE"
  ventasPorHora: number[];         // 24 horas
  diaPico: string;                 // Día con mayor volumen (ej. "Sábado")
  ventasPorDia: { dia: string; label: string; unidades: number }[]; // 7 días (Lunes a Domingo)

  stockTienda?: number;
  stockPrincipal?: number;
  stockTotal?: number;
  costoTotalEstimado?: number;
  margenSoles?: number;
  margenPorcentaje?: number;
}

export interface BrandPortfolioMetric {
  marca: string;
  totalUnidades: number;
  totalIngreso: number;
  totalTickets: number;
  shareUnidadesPct: number;
  shareIngresoPct: number;
  productosCount: number;
  horaPico: number;
  franjaPico: string;
  diaPico: string;
  ventasPorHora: { hora: number; label: string; unidades: number }[];
  ventasPorDia: { dia: string; label: string; unidades: number }[];
  topLineas: { linea: string; unidades: number; ingreso: number }[];
}

export type ProductMarginRanking = ProductCatalogRanking;

export interface UnifiedClient {
  id: string;
  nombre: string;
  dni?: string;
  celular?: string;
  email?: string;
  cumpleanos?: string;
  sede?: string;
  totalServicios: number;
  totalComprasRetail: number;
  montoTotalGastado: number;
  ultimaVisita: string;
  esCrossBuyer: boolean;
}

export interface ExecutiveKPIs {
  totalFacturacionGlobal: number;
  totalFacturacionServicios: number;
  totalComisionesServicios: number;
  totalIngresosRetail: number;
  margenBrutoGlobalSoles: number;
  margenBrutoGlobalPct: number;
  totalTicketsRetail: number;
  ticketPromedioRetail: number;
  totalServiciosAtendidos: number;
  tasaCancelacionServicios: number;
  totalComisionesPagadas: number;
  totalComisionesPendientes: number;
  totalHorasTrabajadasStaff: number;
  tasaConversionCrossSell: number;
  totalClientesUnicos: number;
  pagoServiciosTarjeta: number;
  pagoServiciosEfectivo: number;
  pagoServiciosDeposito: number;
}

export interface SheetIdsConfig {
  adminSheetId: string;
  recepcionSheetId: string;
  erpSheetId: string;
  ventasCajaSheetId: string;
  gonzalesSheetId: string;
  luxurySheetId: string;
  glossSheetId?: string;
  despachosSheetId?: string;
}

export type DemandNormalizationMode = "relative_pct" | "daily_avg" | "per_stylist" | "absolute";
export type BenchmarkTimeWindow = "year_2026" | "all_history";

export interface NormalizedDemandPoint {
  key: string;       // Hora ("17:00") o Día ("Sábado")
  label: string;
  rd: {
    absolute: number;
    relativePct: number;
    dailyAvg: number;
    perStylist: number;
  };
  luxury: {
    absolute: number;
    relativePct: number;
    dailyAvg: number;
    perStylist: number;
  };
  gonzales: {
    absolute: number;
    relativePct: number;
    dailyAvg: number;
    perStylist: number;
  };
  gloss?: {
    absolute: number;
    relativePct: number;
    dailyAvg: number;
    perStylist: number;
  };
}

export interface GonzalesSaleRecord {
  id: string;
  fecha: string;          // ISO YYYY-MM-DD
  diaSemana: string;      // Lunes a Domingo
  razonSocial: string;    // ECARMEN | EGPOGONZALES | CBBJ.ELECTRO
  docTipo: string;        // BOL | FAC
  docNumero: string;
  cliente: string;
  estilista: string;
  item: string;
  categoria: string;
  cantidad: number;
  importe: number;
  horaInferidaPico?: number;
}

export interface BranchKpiSummary {
  sedeId: "RD" | "LUXURY_RD" | "GONZALES_AM" | "GLOSS_SALON";
  nombre: string;
  badge: string;
  color: string;
  tieneModuloRecepcion: boolean;
  diasOperativos: number;
  totalFacturado: number;
  totalTransacciones: number;
  totalServicios: number;
  totalRetail?: number;
  ticketPromedio: number;
  estilistasActivos: number;
  productividadPorEstilista: number;
  mixCategorias: { categoria: string; cantidad: number; ingreso: number; sharePct: number }[];
  distribucionSemanal: { dia: string; label: string; unidades: number; ingreso: number; sharePct: number }[];
  distribucionHoraria: { hora: number; label: string; atenciones: number; ingresoEstimado: number }[];
  horaPico: number;
  franjaPico: string;
  facturacionMensualPromedio: number;
  estilistasMensualesPromedio: number;
  ticketPromedioEstilismo: number;
  ticketPromedioCosmiatria: number;
  comprobantesSemanales?: { dia: string; label: string; comprobantesTotal: number; promedioDiario: number; sharePct: number }[];
}

export interface BranchCancellationSummary {
  sedeId: "RD" | "LUXURY_RD" | "GONZALES_AM" | "GLOSS_SALON";
  nombre: string;
  totalAtenciones: number;
  totalCancelados: number;
  tasaCancelacionPct: number;
  topMotivos: { motivo: string; count: number }[];
}

export interface MultiBranchBenchmark {
  branches: {
    RD: BranchKpiSummary;
    LUXURY_RD: BranchKpiSummary;
    GONZALES_AM: BranchKpiSummary;
    GLOSS_SALON?: BranchKpiSummary;
  };
  comparativaMix: {
    categoria: string;
    rdPct: number;
    luxuryPct: number;
    gonzalesPct: number;
    glossPct?: number;
  }[];
  comparativaSemanal: {
    dia: string;
    label: string;
    rd: number;
    luxury: number;
    gonzales: number;
    gloss?: number;
  }[];
  comparativaHoraria: {
    hora: number;
    label: string;
    rdReal: number;
    luxuryReal: number;
    gonzalesInferido: number;
    glossReal?: number;
  }[];
  comparativaSemanalNormalizada: NormalizedDemandPoint[];
  comparativaHorariaNormalizada: NormalizedDemandPoint[];
  comparativaSemanalComprobantes?: {
    key: string;
    label: string;
    rd: { comprobantesTotal: number; dailyAvg: number; relativePct: number };
    luxury: { comprobantesTotal: number; dailyAvg: number; relativePct: number };
    gonzales: { comprobantesTotal: number; dailyAvg: number; relativePct: number };
    gloss: { comprobantesTotal: number; dailyAvg: number; relativePct: number };
  }[];
  comparativaCancelaciones?: BranchCancellationSummary[];
  benchmark2026?: {
    branches: {
      RD: BranchKpiSummary;
      LUXURY_RD: BranchKpiSummary;
      GONZALES_AM: BranchKpiSummary;
      GLOSS_SALON?: BranchKpiSummary;
    };
    comparativaSemanalNormalizada: NormalizedDemandPoint[];
    comparativaHorariaNormalizada: NormalizedDemandPoint[];
    comparativaSemanalComprobantes?: {
      key: string;
      label: string;
      rd: { comprobantesTotal: number; dailyAvg: number; relativePct: number };
      luxury: { comprobantesTotal: number; dailyAvg: number; relativePct: number };
      gonzales: { comprobantesTotal: number; dailyAvg: number; relativePct: number };
      gloss: { comprobantesTotal: number; dailyAvg: number; relativePct: number };
    }[];
    comparativaMix: {
      categoria: string;
      rdPct: number;
      luxuryPct: number;
      gonzalesPct: number;
      glossPct?: number;
    }[];
  };
  vaikunthaBusinessCase: {
    ventasPerdidasEstimadasGonzales: number;
    citasPerdidasEstimadasGonzales: number;
    tasaAnonimatoClienteGonzales: number;
    totalClientesAnonimosGonzales: number;
    totalClientesIdentificadosGonzales: number;
    horasCiegasEspera: string;
    desajusteTurnosEstimado: string;
  };
}

export interface Dashboard360Response {
  metadata: {
    title: string;
    generatedAt: string;
    source: "google_sheets_live" | "mock_offline";
    sheetIds: SheetIdsConfig;
    counts: {
      agentes: number;
      liquidaciones: number;
      oatc: number;
      asistencia: number;
      tickets: number;
      ventasDetalle: number;
      kardex: number;
      ventasCaja: number;
      bbddProductos?: number;
      gonzalesVentas?: number;
      luxuryVentas?: number;
      luxuryOatc?: number;
      luxuryAsistencia?: number;
      luxuryAgentes?: number;
      luxuryClientes?: number;
      glossVentas?: number;
      glossOatc?: number;
      glossAsistencia?: number;
      glossAgentes?: number;
      glossClientes?: number;
    };
  };
  executiveKPIs: ExecutiveKPIs;
  agents: AgentMaster[];
  staff360: Staff360[];
  productRankings: ProductMarginRanking[];
  serviceCategoryRankings: ServiceCategoryMetric[];
  oatcCategoryMetrics?: OatcCategoryMetric[];
  specificPortfolioRankings?: SpecificPortfolioItemMetric[];
  clients: UnifiedClient[];
  orders: OatcRecord[];
  attendance: AttendanceRecord[];
  tickets: TicketRecord[];
  ticketDetails: TicketDetailRecord[];
  kardex: KardexRecord[];
  settlements: SettlementRecord[];
  cashServiceSales: CashServiceSaleRecord[];
  brandPortfolioMetrics?: BrandPortfolioMetric[];
  multiBranchBenchmark?: MultiBranchBenchmark;
  gonzalesSales?: GonzalesSaleRecord[];
  luxurySales?: GonzalesSaleRecord[];
  glossSales?: GonzalesSaleRecord[];
}

export type ActiveTab = "executive" | "operations" | "retail" | "kardex" | "staff" | "clients" | "benchmark" | "supplies";

export interface MultiSalonRetailProduct {
  producto: string;
  marca: string;
  presentacion?: string;
  unidades: number;
  ingresoTotal: number;
  precioPromedio: number;
  sedes: string[];
}

export type SalonFilter = "ALL" | "RD" | "LUXURY_RD" | "GONZALES_AM" | "GLOSS_SALON";

export interface SalonDescriptor {
  id: SalonFilter;
  nombre: string;
  badge: string;
  color: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
  dotColor: string;
  tieneVentas: boolean;
  tieneRecepcionOatc: boolean;
  tieneAsistencia: boolean;
  tieneKardexRetail: boolean;
}

export interface SalonContribution {
  salonId: SalonFilter;
  nombre: string;
  totalFacturado: number;
  totalTransacciones: number;
  totalServicios: number;
  ticketPromedio: number;
  sharePct: number;
  color: string;
  badge: string;
}

export const SALONES_CONFIG: Record<SalonFilter, SalonDescriptor> = {
  ALL: {
    id: "ALL",
    nombre: "Todos los Salones",
    badge: "Consolidado Multi-Sede",
    color: "#6366f1",
    bgLight: "bg-slate-100",
    borderLight: "border-slate-300",
    textColor: "text-slate-800",
    dotColor: "bg-indigo-500",
    tieneVentas: true,
    tieneRecepcionOatc: true,
    tieneAsistencia: true,
    tieneKardexRetail: true
  },
  RD: {
    id: "RD",
    nombre: "Salón RD",
    badge: "Principal (ERP + AppSheet)",
    color: "#4f46e5",
    bgLight: "bg-indigo-50",
    borderLight: "border-indigo-200",
    textColor: "text-indigo-700",
    dotColor: "bg-indigo-600",
    tieneVentas: true,
    tieneRecepcionOatc: true,
    tieneAsistencia: true,
    tieneKardexRetail: true
  },
  LUXURY_RD: {
    id: "LUXURY_RD",
    nombre: "Luxury RD",
    badge: "G Luxury (POS + AppSheet)",
    color: "#059669",
    bgLight: "bg-emerald-50",
    borderLight: "border-emerald-200",
    textColor: "text-emerald-700",
    dotColor: "bg-emerald-600",
    tieneVentas: true,
    tieneRecepcionOatc: true,
    tieneAsistencia: true,
    tieneKardexRetail: false
  },
  GONZALES_AM: {
    id: "GONZALES_AM",
    nombre: "Gonzales AM",
    badge: "Solo Caja POS",
    color: "#d97706",
    bgLight: "bg-amber-50",
    borderLight: "border-amber-300",
    textColor: "text-amber-800",
    dotColor: "bg-amber-500",
    tieneVentas: true,
    tieneRecepcionOatc: false,
    tieneAsistencia: false,
    tieneKardexRetail: false
  },
  GLOSS_SALON: {
    id: "GLOSS_SALON",
    nombre: "Gloss Salon",
    badge: "OATC Digital + Asistencia",
    color: "#ec4899",
    bgLight: "bg-pink-50",
    borderLight: "border-pink-200",
    textColor: "text-pink-700",
    dotColor: "bg-pink-500",
    tieneVentas: false,
    tieneRecepcionOatc: true,
    tieneAsistencia: true,
    tieneKardexRetail: false
  }
};

// ==========================================
// DESPACHO DE INSUMOS & LABORATORIO TYPES
// ==========================================

export interface SupplyDispatchRecord {
  id: string;
  fecha: string;
  anio: string;
  mes: string;
  diaSemana?: string;
  dependiente: string;
  producto: string;
  marca: string;
  tipo: string;
  cantidad: number;
  volumen?: string;
  observacion?: string;
  costo?: number;
  ticket?: string;
  hora?: string;
  oatcId?: string;
  clienteNombre?: string;
  dni?: string;
  trazabilidad: "CON_OATC" | "CON_TICKET" | "USO_INTERNO";
}

export interface SupplyYearlyMetric {
  anio: string;
  despachosCount: number;
  costoTotal: number;
  costoPromedio: number;
  dependientesCount: number;
  marcasCount: number;
  conOatcCount: number;
  conTicketCount: number;
}

export interface SupplyMonthlyMetric {
  periodo: string;
  anio: string;
  mes: string;
  despachosCount: number;
  costoTotal: number;
}

export interface SupplyStylistConsumption {
  dependiente: string;
  totalDespachos: number;
  costoTotal: number;
  costoPromedio: number;
  shareDespachosPct: number;
  topMarcas: { marca: string; count: number }[];
  topInsumos: { tipo: string; count: number }[];
  ultimoDespacho?: string;
}

export interface SupplyBrandMetric {
  marca: string;
  totalDespachos: number;
  costoTotal: number;
  shareDespachosPct: number;
  topProductos: { producto: string; count: number }[];
}

export interface SupplyTypeMetric {
  tipo: string;
  totalDespachos: number;
  costoTotal: number;
  shareDespachosPct: number;
}

export interface SuppliesDashboardResponse {
  metadata: {
    totalFilas: number;
    sheetId: string;
    generatedAt: string;
  };
  kpis: {
    totalDespachos: number;
    totalCostoRegistrado: number;
    costoPromedioPorDespacho: number;
    totalColaboradores: number;
    totalMarcas: number;
    totalTipos: number;
    tasaConTrazabilidadPct: number;
    conOatcCount: number;
    conTicketCount: number;
    usoInternoCount: number;
  };
  yearlyTrends: SupplyYearlyMetric[];
  monthlyTrends: SupplyMonthlyMetric[];
  stylistRankings: SupplyStylistConsumption[];
  brandRankings: SupplyBrandMetric[];
  typeRankings: SupplyTypeMetric[];
  recentDispatches: SupplyDispatchRecord[];
}

