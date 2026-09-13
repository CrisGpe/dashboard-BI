import { Dashboard360Response, SheetIdsConfig } from "./types.js";

export function getFallbackMockData(sheetIds: SheetIdsConfig): Dashboard360Response {
  return {
    metadata: {
      title: "Dashboard Ejecutivo 360 (Modo Demo Offline)",
      generatedAt: new Date().toISOString(),
      source: "mock_offline",
      sheetIds,
      counts: {
        agentes: 12,
        liquidaciones: 45,
        oatc: 120,
        asistencia: 30,
        tickets: 85,
        ventasDetalle: 140,
        kardex: 110,
        ventasCaja: 150
      }
    },
    executiveKPIs: {
      totalFacturacionGlobal: 54200.5,
      totalFacturacionServicios: 35750.0,
      totalComisionesServicios: 12850.0,
      totalIngresosRetail: 18450.5,
      margenBrutoGlobalSoles: 29400.0,
      margenBrutoGlobalPct: 54,
      totalTicketsRetail: 85,
      ticketPromedioRetail: 217.06,
      totalServiciosAtendidos: 112,
      tasaCancelacionServicios: 6.7,
      totalComisionesPagadas: 8420.0,
      totalComisionesPendientes: 1890.5,
      totalHorasTrabajadasStaff: 240,
      tasaConversionCrossSell: 28.5,
      totalClientesUnicos: 95,
      pagoServiciosTarjeta: 28000.0,
      pagoServiciosEfectivo: 6500.0,
      pagoServiciosDeposito: 1250.0
    },
    agents: [
      {
        ficha: 1,
        nombre: "Vidal Gonzales",
        relacionLaboral: "Dependiente",
        salon: "RD",
        hrEntrada: "9:00 AM",
        hrSalida: "8:00 PM",
        diaDescanso: "domingo",
        estado: "Activo",
        especialidad: "Jefe Operativo"
      }
    ],
    staff360: [
      {
        agente: "Vidal Gonzales",
        salon: "RD",
        especialidad: "Jefe Operativo",
        estado: "Activo",
        totalServicios: 24,
        serviciosCancelados: 1,
        rechazosReales: 1,
        erroresRegistro: 0,
        ratioBateo: 96.0,
        serviciosTop: [
          { servicio: "Corte y diseño", count: 14 },
          { servicio: "Tratamientos Capilares", count: 8 },
          { servicio: "Colorimetria", count: 2 }
        ],
        totalFacturadoServicios: 8900.0,
        totalComisionesServicios: 3200.0,
        ticketPromedioServicio: 370.83,
        totalVentasRetail: 3420.0,
        cantidadProductosVendidos: 28,
        ticketPromedioRetail: 190.0,
        margenAportadoEmpresa: 6800.0,
        facturacionPorHora: 289.88,
        totalLiquidado: 1450.0,
        totalPendienteLiquidacion: 280.0,
        diasAsistidos: 5,
        horasTotalesTrabajadas: 42.5,
        serviciosPorHora: 0.56,
        crossSellCount: 8,
        crossSellRate: 33.3
      },
      {
        agente: "Cocó Pacheco",
        salon: "RD",
        especialidad: "Estilismo",
        estado: "Activo",
        totalServicios: 32,
        serviciosCancelados: 2,
        rechazosReales: 2,
        erroresRegistro: 0,
        ratioBateo: 94.1,
        serviciosTop: [
          { servicio: "Colorimetria", count: 18 },
          { servicio: "Alisados", count: 10 },
          { servicio: "Corte y diseño", count: 4 }
        ],
        totalFacturadoServicios: 12400.0,
        totalComisionesServicios: 4600.0,
        ticketPromedioServicio: 387.5,
        totalVentasRetail: 4850.0,
        cantidadProductosVendidos: 35,
        ticketPromedioRetail: 230.95,
        margenAportadoEmpresa: 9400.0,
        facturacionPorHora: 383.33,
        totalLiquidado: 2100.0,
        totalPendienteLiquidacion: 420.0,
        diasAsistidos: 5,
        horasTotalesTrabajadas: 45.0,
        serviciosPorHora: 0.71,
        crossSellCount: 12,
        crossSellRate: 37.5
      }
    ],
    productRankings: [
      {
        sku: "P00001",
        marca: "Kerastase",
        linea: "Nutritive",
        producto: "Bain Satin Nutritive",
        presentacion: "250ml",
        unidadesVendidas: 24,
        ticketsCount: 22,
        ingresoTotal: 2640.0,
        precioPromedio: 110.0,
        rotacionVelocidadDiaria: 0.8,
        penetracionTicketsPct: 15.2,
        clasificacionABC: "A",
        horaPico: 19,
        franjaPico: "TARDE PICO (16:00 - 20:00)",
        ventasPorHora: [0,0,0,0,0,0,0,0,0,1,2,3,4,2,3,2,1,2,2,2,0,0,0,0],
        diaPico: "Sábado",
        ventasPorDia: [
          { dia: "Lunes", label: "Lun", unidades: 2 },
          { dia: "Martes", label: "Mar", unidades: 3 },
          { dia: "Miércoles", label: "Mié", unidades: 2 },
          { dia: "Jueves", label: "Jue", unidades: 4 },
          { dia: "Viernes", label: "Vie", unidades: 4 },
          { dia: "Sábado", label: "Sáb", unidades: 7 },
          { dia: "Domingo", label: "Dom", unidades: 2 }
        ],
        stockTienda: 83,
        stockPrincipal: 4,
        stockTotal: 87,
        costoTotalEstimado: 1784.16,
        margenSoles: 855.84,
        margenPorcentaje: 32
      }
    ],
    serviceCategoryRankings: [
      {
        categoria: "Estilismo",
        subcategoria: "Colorimetría",
        serviciosCount: 45,
        facturacionTotal: 18500.0,
        comisionesTotal: 6800.0,
        margenSoles: 11700.0,
        margenPct: 63
      },
      {
        categoria: "Estilismo",
        subcategoria: "Corte y diseño",
        serviciosCount: 60,
        facturacionTotal: 7200.0,
        comisionesTotal: 2600.0,
        margenSoles: 4600.0,
        margenPct: 64
      }
    ],
    clients: [
      {
        id: "c-1",
        nombre: "Cristian Gonzales Zegarra",
        dni: "74074559",
        celular: "952803788",
        totalServicios: 4,
        totalComprasRetail: 3,
        montoTotalGastado: 480.0,
        ultimaVisita: "2026-03-01",
        esCrossBuyer: true
      }
    ],
    orders: [
      {
        id: "OATC-1",
        hrRegistro: "10:00 AM",
        numeroOatc: 1,
        tipoOatc: "Colorimetria",
        fechaRegistro: "2026-03-01",
        clienteNombre: "Cristian Gonzales Zegarra",
        tipoCliente: "Cliente",
        agente: "Cocó Pacheco",
        horaResolucion: "12:30 PM",
        isCancelled: false,
        source: "OATC"
      }
    ],
    attendance: [
      {
        id: "ATT-1",
        fecha: "2026-03-01",
        dependiente: "Cocó Pacheco",
        entrada: "9:00 AM",
        salida: "8:00 PM",
        turnos: 2,
        clientes: 4,
        totalAtenciones: 6,
        horasTrabajadas: 11
      }
    ],
    tickets: [
      {
        ticket: "BY03-00003747",
        fecha: "2026-03-01",
        cliente: "Cristian Gonzales Zegarra | DNI: 74074559 | Cel: 952803788",
        clienteNombreLimpio: "Cristian Gonzales Zegarra",
        clienteDni: "74074559",
        clienteCelular: "952803788",
        asesor: "Cocó Pacheco",
        subtotal: 110,
        total: 110,
        estado: "COMPLETADO",
        metodoPago: "EFECTIVO",
        tipoDoc: "Boleta",
        nroDoc: "BY03-00003747"
      }
    ],
    ticketDetails: [
      {
        id: "VD-1",
        ticket: "BY03-00003747",
        fecha: "2026-03-01",
        sku: "P00051",
        producto: "Bain Curl Manifesto",
        cantidad: 1,
        precioUnitario: 110,
        subtotal: 110,
        costoUnitario: 75,
        margenSoles: 35
      }
    ],
    kardex: [
      {
        idMovimiento: "MOV-1001",
        fechaHora: "2026-03-01",
        tipoMovimiento: "VENTA",
        sku: "P00051",
        descripcion: "Bain Curl Manifesto",
        cantidad: 1,
        origen: "ALMACEN_TIENDA",
        destino: "CLIENTE_FINAL",
        documentoRef: "BY03-00003747",
        costoUnitario: 75
      }
    ],
    settlements: [
      {
        idAutorizacion: "AUTH-101",
        fechaSolicitud: "2026-03-01",
        agente: "Cocó Pacheco",
        rangoFechas: "2026-03-01 al 2026-03-07",
        montoPagar: 350.0,
        estado: "Pagado",
        autorizadoPor: "admin@vaikuntha.pe",
        fechaPago: "2026-03-07"
      }
    ],
    cashServiceSales: [
      {
        id: "CS-1",
        fecha: "2026-03-01",
        ticketId: "TKT-101",
        idOatc: 1,
        cliente: "Cristian Gonzales Zegarra",
        agente: "Cocó Pacheco",
        servicioOriginal: "Colorimetria",
        servicioFinal: "Balayage Premium",
        servicioSubCategoria: "Colorimetria",
        servicioCategoria: "Estilismo",
        montoEfectivo: 0,
        montoTarjeta: 350,
        montoDeposito: 0,
        montoFinal: 350,
        comision: 140,
        estado: "Cobrado",
        ruc: "VG",
        boleta: "BS-0001",
        mes: "marzo",
        anio: "2026"
      }
    ],
    brandPortfolioMetrics: [
      {
        marca: "Kerastase",
        totalUnidades: 1205,
        totalIngreso: 85200.0,
        totalTickets: 840,
        shareUnidadesPct: 29.2,
        shareIngresoPct: 35.4,
        productosCount: 194,
        horaPico: 20,
        franjaPico: "NOCHE (20:00 - 23:00)",
        diaPico: "Sábado",
        ventasPorHora: [
          { hora: 9, label: "09:00", unidades: 12 },
          { hora: 12, label: "12:00", unidades: 65 },
          { hora: 19, label: "19:00", unidades: 140 },
          { hora: 20, label: "20:00", unidades: 160 }
        ],
        ventasPorDia: [
          { dia: "Lunes", label: "Lun", unidades: 140 },
          { dia: "Martes", label: "Mar", unidades: 145 },
          { dia: "Miércoles", label: "Mié", unidades: 135 },
          { dia: "Jueves", label: "Jue", unidades: 170 },
          { dia: "Viernes", label: "Vie", unidades: 160 },
          { dia: "Sábado", label: "Sáb", unidades: 275 },
          { dia: "Domingo", label: "Dom", unidades: 180 }
        ],
        topLineas: [
          { linea: "Nutritive", unidades: 148, ingreso: 16280 },
          { linea: "Blond Absolu", unidades: 112, ingreso: 13440 }
        ]
      }
    ],
    oatcCategoryMetrics: [
      {
        categoria: "Colorimetría",
        demandaTotalOatc: 2450,
        atencionesEfectivas: 2310,
        canceladasCount: 140,
        tasaCancelacionPct: 5.7,
        facturacionTotal: 543000.0,
        comisionesTotal: 206000.0,
        margenSoles: 337000.0,
        margenPct: 62,
        ticketPromedio: 235.06
      },
      {
        categoria: "Cosmiatría",
        demandaTotalOatc: 1820,
        atencionesEfectivas: 1740,
        canceladasCount: 80,
        tasaCancelacionPct: 4.4,
        facturacionTotal: 258000.0,
        comisionesTotal: 98000.0,
        margenSoles: 160000.0,
        margenPct: 62,
        ticketPromedio: 148.28
      },
      {
        categoria: "Tratamientos Capilares",
        demandaTotalOatc: 1640,
        atencionesEfectivas: 1580,
        canceladasCount: 60,
        tasaCancelacionPct: 3.7,
        facturacionTotal: 236000.0,
        comisionesTotal: 89600.0,
        margenSoles: 146400.0,
        margenPct: 62,
        ticketPromedio: 149.37
      },
      {
        categoria: "Corte y Diseño",
        demandaTotalOatc: 4100,
        atencionesEfectivas: 3950,
        canceladasCount: 150,
        tasaCancelacionPct: 3.7,
        facturacionTotal: 160000.0,
        comisionesTotal: 60800.0,
        margenSoles: 99200.0,
        margenPct: 62,
        ticketPromedio: 40.51
      }
    ],
    specificPortfolioRankings: [
      {
        id: "srv_tinte_cabello_medio",
        nombre: "Tinte cabello medio",
        tipo: "SERVICIO",
        categoriaPadre: "Colorimetría",
        volumen: 2012,
        facturacionTotal: 301800.0,
        comisionOCostoTotal: 114684.0,
        margenSoles: 187116.0,
        margenPct: 62,
        precioPromedio: 150.0
      },
      {
        id: "srv_corte_cabello_corto",
        nombre: "Corte cabello corto",
        tipo: "SERVICIO",
        categoriaPadre: "Corte y Diseño",
        volumen: 3745,
        facturacionTotal: 157290.0,
        comisionOCostoTotal: 59770.0,
        margenSoles: 97520.0,
        margenPct: 62,
        precioPromedio: 42.0
      },
      {
        id: "prd_kerastase_elixir_ultime",
        nombre: "Huile Originale Elixir Ultime 100ml",
        tipo: "PRODUCTO",
        categoriaPadre: "Kerastase - Elixir Ultime",
        volumen: 539,
        facturacionTotal: 102410.0,
        comisionOCostoTotal: 46084.5,
        margenSoles: 56325.5,
        margenPct: 55,
        precioPromedio: 190.0
      }
    ]
  };
}
