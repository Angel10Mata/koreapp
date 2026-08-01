"use client";

import { useMemo, useState } from "react";

interface FlujoCajaItem {
  id: string;
  fecha: string;
  monto: number;
  tipo_movimiento: "ingreso" | "egreso";
  descripcion?: string;
  categoria?: string;
  estado?: string;
}

interface FinanzasChartProps {
  data: FlujoCajaItem[];
  filterPeriod: "dia" | "mes" | "rango";
  dateDia: string;   // "YYYY-MM-DD"
  dateMes: string;   // "YYYY-MM"
  dateRango: { start: string; end: string };
}

interface DataPoint {
  label: string;
  ingresos: number;
  egresos: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  point: DataPoint | null;
}

function formatQ(val: number) {
  return `Q ${val.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function FinanzasChart({ data, filterPeriod, dateDia, dateMes, dateRango }: FinanzasChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, point: null,
  });

  const activeData = useMemo(() => data.filter(item => item.estado !== "anulado"), [data]);

  // Construir grilla completa según el período
  const chartData = useMemo<DataPoint[]>(() => {

    // ── MODO DÍA: mostrar todos los días del mes seleccionado ──────────────
    if (filterPeriod === "dia") {
      // Usar el mes del selector de día (dateDia)
      const [yr, mo] = dateDia.split("-").map(Number);
      const daysInMonth = new Date(yr, mo, 0).getDate();

      // Acumular por día del mes
      const acc: Record<number, { ingresos: number; egresos: number }> = {};
      for (let d = 1; d <= daysInMonth; d++) acc[d] = { ingresos: 0, egresos: 0 };

      activeData.forEach(item => {
        const d = new Date(item.fecha);
        if (d.getFullYear() === yr && d.getMonth() + 1 === mo) {
          const day = d.getDate();
          const amt = Number(item.monto) || 0;
          if (item.tipo_movimiento === "ingreso") acc[day].ingresos += amt;
          else acc[day].egresos += amt;
        }
      });

      return Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1).padStart(2, "0"),
        ingresos: acc[i + 1].ingresos,
        egresos: acc[i + 1].egresos,
      }));
    }

    // ── MODO MES: mostrar todos los meses del año ──────────────────────────
    if (filterPeriod === "mes") {
      const yr = parseInt(dateMes.split("-")[0]);

      const acc: Record<number, { ingresos: number; egresos: number }> = {};
      for (let m = 1; m <= 12; m++) acc[m] = { ingresos: 0, egresos: 0 };

      activeData.forEach(item => {
        const d = new Date(item.fecha);
        if (d.getFullYear() === yr) {
          const mo = d.getMonth() + 1;
          const amt = Number(item.monto) || 0;
          if (item.tipo_movimiento === "ingreso") acc[mo].ingresos += amt;
          else acc[mo].egresos += amt;
        }
      });

      return Array.from({ length: 12 }, (_, i) => ({
        label: MONTH_NAMES[i],
        ingresos: acc[i + 1].ingresos,
        egresos: acc[i + 1].egresos,
      }));
    }

    // ── MODO RANGO: agrupar por fecha ──────────────────────────────────────
    const start = new Date(dateRango.start + "T00:00:00");
    const end   = new Date(dateRango.end   + "T23:59:59");

    // Generar todos los días del rango
    const days: DataPoint[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      days.push({ label: cur.toISOString().split("T")[0], ingresos: 0, egresos: 0 });
      cur.setDate(cur.getDate() + 1);
    }

    activeData.forEach(item => {
      const d = new Date(item.fecha);
      if (d >= start && d <= end) {
        const key = d.toISOString().split("T")[0];
        const idx = days.findIndex(p => p.label === key);
        if (idx !== -1) {
          const amt = Number(item.monto) || 0;
          if (item.tipo_movimiento === "ingreso") days[idx].ingresos += amt;
          else days[idx].egresos += amt;
        }
      }
    });

    // Formatear label a día/mes
    return days.map(d => {
      const [, m, day] = d.label.split("-");
      return { ...d, label: `${day}/${m}` };
    });

  }, [activeData, filterPeriod, dateDia, dateMes, dateRango]);

  // Subtítulo dinámico
  const subtitle = useMemo(() => {
    if (filterPeriod === "dia") {
      const [yr, mo] = dateDia.split("-").map(Number);
      return `${MONTH_NAMES[mo - 1]} ${yr} · todos los días`;
    }
    if (filterPeriod === "mes") {
      return `${dateMes.split("-")[0]} · todos los meses`;
    }
    return `${dateRango.start} → ${dateRango.end}`;
  }, [filterPeriod, dateDia, dateMes, dateRango]);

  if (chartData.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-[#161618] border border-slate-200 dark:border-[#2A2A2E] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#212124] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-gray-500">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <p className="text-sm text-slate-400 dark:text-gray-500 font-medium">Sin datos para graficar</p>
      </div>
    );
  }

  // ── Dimensiones SVG ──────────────────────────────────────────────────────
  const PADDING = { top: 24, right: 20, bottom: 44, left: 70 };
  const chartWidth  = 900;
  const chartHeight = 260;
  const innerW = chartWidth - PADDING.left - PADDING.right;
  const innerH = chartHeight - PADDING.top  - PADDING.bottom;

  const maxVal = Math.max(...chartData.map(d => Math.max(d.ingresos, d.egresos)), 1);
  const n = chartData.length;

  const scaleY = (val: number) => innerH - (val / maxVal) * innerH;
  const scaleX = (i: number)   => n === 1 ? innerW / 2 : (i / (n - 1)) * innerW;

  const toLinePath = (key: "ingresos" | "egresos") =>
    chartData.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i).toFixed(1)} ${scaleY(d[key]).toFixed(1)}`).join(" ");

  const toAreaPath = (key: "ingresos" | "egresos") => {
    const pts = chartData.map((d, i) => ({ x: scaleX(i), y: scaleY(d[key]) }));
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    return `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${innerH} L ${pts[0].x.toFixed(1)} ${innerH} Z`;
  };

  // Grid labels Y
  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  // X labels: mostrar un subconjunto para no saturar
  const maxXLabels = filterPeriod === "mes" ? 12 : 12;
  const step = Math.max(1, Math.ceil(n / maxXLabels));

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const relX = (e.clientX - rect.left - (PADDING.left / chartWidth) * rect.width);
    const innerWidth = rect.width - (PADDING.left / chartWidth) * rect.width - (PADDING.right / chartWidth) * rect.width;
    const ratio = Math.max(0, Math.min(1, relX / innerWidth));
    const idx = n === 1 ? 0 : Math.round(ratio * (n - 1));
    const pt = chartData[idx];
    if (!pt) return;

    setTooltip({
      visible: true,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
      point: pt,
    });
  };

  return (
    <div className="w-full bg-white dark:bg-[#161618] border border-slate-200 dark:border-[#2A2A2E] rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
            Flujo Financiero
          </h3>
          <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-emerald-500 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-rose-500 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Egresos</span>
          </div>
        </div>
      </div>

      {/* SVG */}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full overflow-visible"
          style={{ height: "auto", minHeight: 160 }}
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={() => setTooltip(t => ({ ...t, visible: false }))}
        >
          <defs>
            <linearGradient id="fi-grad-ing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#10b981" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="fi-grad-eg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f43f5e" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g transform={`translate(${PADDING.left}, ${PADDING.top})`}>
            {/* Grid horizontal */}
            {gridTicks.map((pct, i) => {
              const y = scaleY(maxVal * pct);
              const label = pct === 0 ? "Q 0" : pct === 0.5 ? formatQ(maxVal * 0.5) : pct === 1 ? formatQ(maxVal) : "";
              return (
                <g key={i}>
                  <line x1={0} y1={y} x2={innerW} y2={y}
                    stroke="currentColor" strokeOpacity={0.07} strokeWidth={1}
                    className="text-slate-900 dark:text-white" />
                  {label && (
                    <text x={-8} y={y + 4} textAnchor="end" fontSize={9}
                      fill="currentColor" className="fill-slate-400 dark:fill-gray-500"
                      style={{ fontFamily: "sans-serif" }}>
                      {label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Áreas */}
            <path d={toAreaPath("ingresos")} fill="url(#fi-grad-ing)" />
            <path d={toAreaPath("egresos")}  fill="url(#fi-grad-eg)"  />

            {/* Líneas */}
            <path d={toLinePath("ingresos")} fill="none" stroke="#10b981"
              strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            <path d={toLinePath("egresos")}  fill="none" stroke="#f43f5e"
              strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

            {/* Puntos — solo cuando hay datos */}
            {chartData.map((d, i) => (
              d.ingresos > 0 && (
                <circle key={`i${i}`} cx={scaleX(i)} cy={scaleY(d.ingresos)}
                  r={4} fill="#10b981" stroke="#fff" strokeWidth={2}
                  style={{ filter: "drop-shadow(0 1px 3px rgba(16,185,129,0.5))" }} />
              )
            ))}
            {chartData.map((d, i) => (
              d.egresos > 0 && (
                <circle key={`e${i}`} cx={scaleX(i)} cy={scaleY(d.egresos)}
                  r={4} fill="#f43f5e" stroke="#fff" strokeWidth={2}
                  style={{ filter: "drop-shadow(0 1px 3px rgba(244,63,94,0.5))" }} />
              )
            ))}

            {/* Labels eje X */}
            {chartData.map((d, i) => {
              if (i % step !== 0 && i !== n - 1) return null;
              return (
                <text key={`xl${i}`} x={scaleX(i)} y={innerH + 20}
                  textAnchor="middle" fontSize={9} fill="currentColor"
                  className="fill-slate-400 dark:fill-gray-500"
                  style={{ fontFamily: "sans-serif" }}>
                  {d.label}
                </text>
              );
            })}
          </g>
        </svg>

        {/* Tooltip */}
        {tooltip.visible && tooltip.point && (
          <div
            className="pointer-events-none absolute z-50 px-3 py-2.5 rounded-xl border shadow-2xl"
            style={{
              left: `clamp(8px, ${tooltip.x}%, calc(100% - 190px))`,
              top:  `clamp(8px, ${tooltip.y - 15}%, calc(100% - 100px))`,
              background: "#1c1c1f",
              borderColor: "#2A2A2E",
              color: "#fff",
              minWidth: 170,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 font-bold">
              {tooltip.point.label}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-gray-300">Ingresos</span>
              <span className="text-emerald-400 font-black ml-auto">{formatQ(tooltip.point.ingresos)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="text-gray-300">Egresos</span>
              <span className="text-rose-400 font-black ml-auto">{formatQ(tooltip.point.egresos)}</span>
            </div>
            <div className="border-t border-white/10 mt-1.5 pt-1.5 flex items-center justify-between text-xs">
              <span className="text-gray-400">Neto</span>
              <span className={`font-black ${tooltip.point.ingresos - tooltip.point.egresos >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatQ(tooltip.point.ingresos - tooltip.point.egresos)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
