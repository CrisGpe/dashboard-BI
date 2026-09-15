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
  fechaRegistro: string; // ISO YYYY-MM-DD
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
  fecha: string; // ISO YYYY-MM-DD
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
  fecha: string; // ISO YYYY-MM-DD
  fechaHoraOriginal?: string;
  diaSemana?: string; // Lunes, Martes, etc.
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
  fecha: string; // ISO YYYY-MM-DD
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
  totalFacturadoServicios: number; // S/. de Registro ventas caja
  totalComisionesServicios: number; // S/. de Registro ventas caja
  ticketPromedioServicio: number;
  totalVentasRetail: number; // S/. de ERP Tickets
  cantidadProductosVendidos: number;
  ticketPromedioRetail: number;
  margenAportadoEmpresa: number; // (Servicios - Comisiones) + (Retail - Costo Estimado)
  facturacionPorHora: number; // (Servicios + Retail) / Horas en salón
  totalLiquidado: number; // S/. de Pendientes_Liquidacion
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
  totalFacturacionGlobal: number; // S/. 2.10M (Servicios + Retail)
  totalFacturacionServicios: number; // S/. 1.62M
  totalComisionesServicios: number; // S/. 572K
  totalIngresosRetail: number; // S/. 481K
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

export interface SupplyDispatchRecord {
  id: string;
  fecha: string;
  diaSemana?: string;
  anio: string;
  mes: string;
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
  periodo: string; // YYYY-MM
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
  despachosCount: number;
  costoTotal: number;
  sharePct: number;
  topProductos: { producto: string; count: number }[];
}

export interface SupplyTypeMetric {
  tipo: string;
  despachosCount: number;
  costoTotal: number;
  sharePct: number;
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

