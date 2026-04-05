import { useState, useCallback } from 'react';
import { useAlquileres } from '../hooks/useAlquileres';
import { usePagos } from '../hooks/usePagos';
import { usePenalidades } from '../hooks/usePenalidades';
import { generarPDFAlquileres } from '../reportes/generators/alquileres.pdf';
import { generarExcelAlquileres } from '../reportes/generators/alquileres.excel';
import { generarPDFFinanciero } from '../reportes/generators/financiero.pdf';
import { generarExcelFinanciero } from '../reportes/generators/financiero.excel';
import { formatMonto } from '../reportes/utils/formato';

// Fecha helper: primer y último día del mes actual
function mesActual() {
  const hoy  = new Date();
  const y    = hoy.getFullYear();
  const m    = String(hoy.getMonth() + 1).padStart(2, '0');
  const ultimo = new Date(y, hoy.getMonth() + 1, 0).getDate();
  return {
    desde: `${y}-${m}-01`,
    hasta: `${y}-${m}-${ultimo}`,
  };
}

export default function ReportesPage() {
  const defaults = mesActual();
  const [desde, setDesde] = useState(defaults.desde);
  const [hasta, setHasta] = useState(defaults.hasta);
  const [generando, setGenerando] = useState<string | null>(null);

  // Hooks de datos existentes en el proyecto
  const { alquileres = [], loading: loadAlq } = useAlquileres();
  const { pagos = [],       loading: loadPag } = usePagos();
  const { penalidades = [], loading: loadPen } = usePenalidades();

  // Filtrar por rango de fecha
  const alquileresFiltrados = alquileres.filter(a => {
    const f = new Date(a.fechaInicio);
    return f >= new Date(desde) && f <= new Date(hasta);
  });

  const pagosFiltrados = pagos.filter(p => {
    if (!p.fecha) return false;
    const f = new Date(p.fecha);
    return f >= new Date(desde) && f <= new Date(hasta);
  });

  const penalidadesFiltradas = penalidades.filter(p => {
    const f = new Date(p.createdAt);
    return f >= new Date(desde) && f <= new Date(hasta);
  });

  // Métricas de resumen
  const totalAlquileres  = alquileresFiltrados.length;
  const montoAlquileres  = alquileresFiltrados.reduce((s, a) => s + Number(a.subtotal ?? 0), 0);
  const totalCobrado     = pagosFiltrados.reduce((s, p) => s + Number(p.monto ?? 0), 0);
  const totalPenalidades = penalidadesFiltradas.reduce((s, p) => s + Number(p.monto ?? 0), 0);
  const saldoPendiente   = montoAlquileres - totalCobrado;

  const loading = loadAlq || loadPag || loadPen;

  const exportar = useCallback(async (tipo: string) => {
    setGenerando(tipo);
    try {
      if (tipo === 'alq-pdf')   generarPDFAlquileres(alquileresFiltrados, desde, hasta);
      if (tipo === 'alq-excel') generarExcelAlquileres(alquileresFiltrados, desde, hasta);
      if (tipo === 'fin-pdf')   generarPDFFinanciero(pagosFiltrados, penalidadesFiltradas, desde, hasta);
      if (tipo === 'fin-excel') generarExcelFinanciero(pagosFiltrados, penalidadesFiltradas, desde, hasta);
    } finally {
      setGenerando(null);
    }
  }, [alquileresFiltrados, pagosFiltrados, penalidadesFiltradas, desde, hasta]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>

      {/* Filtros de período */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Período</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tarjetas resumen */}
      {loading ? (
        <div className="text-gray-500 text-sm">Cargando datos...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Alquileres" value={String(totalAlquileres)} sub="en el período" color="blue" />
          <StatCard label="Facturado" value={formatMonto(montoAlquileres)} sub="subtotal total" color="indigo" />
          <StatCard label="Cobrado" value={formatMonto(totalCobrado)} sub="pagos recibidos" color="green" />
          <StatCard label="Pendiente" value={formatMonto(saldoPendiente)} sub="saldo a cobrar" color="amber" />
        </div>
      )}

      {/* Sección Alquileres */}
      <ReporteCard
        titulo="Reporte de Alquileres"
        descripcion={`${alquileresFiltrados.length} alquileres en el período seleccionado`}
        onPDF={() => exportar('alq-pdf')}
        onExcel={() => exportar('alq-excel')}
        generando={generando}
        ids={['alq-pdf', 'alq-excel']}
        disabled={loading || alquileresFiltrados.length === 0}
      />

      {/* Sección Financiero */}
      <ReporteCard
        titulo="Reporte Financiero"
        descripcion={`${pagosFiltrados.length} pagos · ${penalidadesFiltradas.length} penalidades · Neto: ${formatMonto(totalCobrado - totalPenalidades)}`}
        onPDF={() => exportar('fin-pdf')}
        onExcel={() => exportar('fin-excel')}
        generando={generando}
        ids={['fin-pdf', 'fin-excel']}
        disabled={loading || (pagosFiltrados.length === 0 && penalidadesFiltradas.length === 0)}
      />
    </div>
  );
}

// ─── Componentes internos ────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: 'blue' | 'indigo' | 'green' | 'amber';
}

const colorMap: Record<StatCardProps['color'], string> = {
  blue:   'bg-blue-50 border-blue-200 text-blue-700',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  green:  'bg-green-50 border-green-200 text-green-700',
  amber:  'bg-amber-50 border-amber-200 text-amber-700',
};

function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  );
}

interface ReporteCardProps {
  titulo: string;
  descripcion: string;
  onPDF: () => void;
  onExcel: () => void;
  generando: string | null;
  ids: [string, string];
  disabled: boolean;
}

function ReporteCard({ titulo, descripcion, onPDF, onExcel, generando, ids, disabled }: ReporteCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-800">{titulo}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{descripcion}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <ExportBtn
            label="PDF"
            icon="📄"
            onClick={onPDF}
            loading={generando === ids[0]}
            disabled={disabled}
            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
          />
          <ExportBtn
            label="Excel"
            icon="📊"
            onClick={onExcel}
            loading={generando === ids[1]}
            disabled={disabled}
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          />
        </div>
      </div>
    </div>
  );
}

interface ExportBtnProps {
  label: string;
  icon: string;
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  className: string;
}

function ExportBtn({ label, icon, onClick, loading, disabled, className }: ExportBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <span>{icon}</span>
      )}
      {label}
    </button>
  );
}
