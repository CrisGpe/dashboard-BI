# Business Analytics & Intelligence 360° (Dashboard BI)

Plataforma ejecutiva y analítica de alto rendimiento para la gestión integral y consolidación multi-sede de cadenas de salones de belleza y estética (**Salón RD**, **Luxury RD**, **Gonzales AM**, **Gloss Salon**).

---

## 🌟 Características Principales

- **Consolidación Multi-Sede & Multi-Fuente**: Sincronización en paralelo de fuentes de Google Sheets (Registros Admin, Recepción OATC, ERP VentaRD, Ventas 2025/2026, Luxury RD, Gonzales AM, Gloss Salon y Despacho de Insumos).
- **Resumen Ejecutivo 360°**: KPIs financieros globales, margen bruto consolidado, distribución de cuota por salón, facturación por línea de negocio (Servicios vs. Retail) y ranking por categoría.
- **Staff 360° Dinámico**:
  - Evaluación integral por colaborador con P&L individual (Facturación, Comisiones, Margen Neto Aportado).
  - Benchmarks de ticket promedio por categoría comparados contra los pares de la propia sede.
  - Filtros temporales dinámicos (Histórico completo, 2026, 2025, Q3, Q2, 30 días, selector por mes).
  - Distribución horaria y ratio de bateo/asistencia.
- **Operaciones & Demanda**:
  - Cruce de órdenes OATC, asistencia y cobros de caja.
  - Tabla unificada de cobros de caja con identificación de sede por badges de color.
  - Módulo de auditoría de rechazos y cancelaciones con discriminación de causas raíz.
- **Clientes & Fidelización**:
  - Segmentación de clientes, recurrencia y valor de vida del cliente (LTV).
- **Auditoría de Despachos de Insumos**:
  - Tablero dedicado para el análisis histórico y control de costos de insumos, marcas y técnicos desde 2022.

---

## 🏗️ Arquitectura Técnica

```
├── client/                     # Frontend SPA (React 19, Vite, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Módulos segregados (executive, staff, operations, clients, supplies)
│   │   ├── hooks/              # useFilteredData, usePagination
│   │   ├── types/              # Contratos de interfaces TypeScript estrictas
│   │   └── utils/              # Normalizadores de ventas POS, formateadores de moneda/fechas
├── server/                     # Backend API (Node.js, Express, TypeScript)
│   ├── src/
│   │   ├── services/           # Sincronización Google Sheets, normalización, motor de benchmark
│   │   ├── controllers/        # Controladores REST API
│   │   └── types/              # DTOs y tipos del backend
└── start.bat                   # Script de inicio rápido automatizado para Windows
```

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/CrisGpe/dashboard-BI.git
cd dashboard-BI
```

### 2. Instalar dependencias
```bash
npm run install:all
```

### 3. Iniciar en Modo Desarrollo
En Windows, puedes ejecutar directamente:
```bash
start.bat
```
O mediante terminal:
```bash
npm run dev
```
- **Frontend SPA**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001/api/dashboard`

### 4. Compilación para Producción
```bash
npm run build
```
