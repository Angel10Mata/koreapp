"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Ban,
  MoreVertical
} from "lucide-react";
import { useFlujoCaja, useAnularGasto, useAnularIngreso } from "@/components/(Kore)/finanzas/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CrearGastoModal } from "@/components/(Kore)/finanzas/forms/CrearGastoModal";
import { FinanzasChart, FlujoCajaItem } from "@/components/(Kore)/finanzas/FinanzasChart";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDay = (y: number, m: number) => new Date(y, m, 1).getDay();

function CustomDatePicker({ value, onChange, align = "center" }: { value: string, onChange: (v: string) => void, align?: "start" | "center" | "end" }) {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date(value + "T00:00:00"));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const handleSelect = (day: number) => {
    const y = year;
    const m = (month + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 bg-white dark:bg-[#161618] border border-slate-200 dark:border-[#2A2A2E] hover:bg-slate-50 dark:hover:bg-[#212124] transition-colors rounded-lg px-4 py-2 text-slate-700 dark:text-gray-300 shrink-0 outline-none focus:ring-1 focus:ring-celeste-kore/50">
          <Calendar className="h-4 w-4" />
          <span>{new Date(value + "T00:00:00").toLocaleDateString("es-GT")}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-4 bg-white dark:bg-[#161618] border-slate-200 dark:border-[#2A2A2E] text-slate-900 dark:text-white rounded-xl shadow-xl z-50">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#2A2A2E] rounded-md transition-colors text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
          <span className="font-bold text-sm tracking-wide">{monthNames[month]} {year}</span>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#2A2A2E] rounded-md transition-colors text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => <div key={`b-${i}`} className="h-8 w-8" />)}
          {days.map(d => {
            const isSelected = value === `${year}-${(month+1).toString().padStart(2,"0")}-${d.toString().padStart(2,"0")}`;
            const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
            return (
              <button 
                key={d} 
                onClick={() => handleSelect(d)}
                className={`h-8 w-8 rounded-md flex items-center justify-center text-sm transition-colors
                  ${isSelected ? 'bg-celeste-kore text-white font-bold shadow-md shadow-celeste-kore/20' : 
                    isToday ? 'bg-slate-100 dark:bg-[#2A2A2E] text-slate-900 dark:text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-[#2A2A2E] text-slate-700 dark:text-gray-300'}`}
              >
                {d}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CustomMonthPicker({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(parseInt(value.split('-')[0]));
  
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 bg-white dark:bg-[#161618] border border-slate-200 dark:border-[#2A2A2E] hover:bg-slate-50 dark:hover:bg-[#212124] transition-colors rounded-lg px-4 py-2 text-slate-700 dark:text-gray-300 shrink-0 outline-none focus:ring-1 focus:ring-celeste-kore/50">
           <Calendar className="h-4 w-4" />
           <span className="capitalize">
              {new Date(value + "-01T00:00:00").toLocaleDateString("es-GT", { month: 'long', year: 'numeric' })}
           </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 bg-white dark:bg-[#161618] border border-slate-200 dark:border-[#2A2A2E] text-slate-900 dark:text-white p-4 rounded-xl shadow-xl z-50">
         <div className="flex justify-between items-center mb-4">
            <button onClick={() => setYear(y => y - 1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#2A2A2E] rounded-md transition-colors text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"><ChevronLeft className="h-4 w-4"/></button>
            <span className="font-bold text-sm tracking-wide">{year}</span>
            <button onClick={() => setYear(y => y + 1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#2A2A2E] rounded-md transition-colors text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"><ChevronRight className="h-4 w-4"/></button>
         </div>
         <div className="grid grid-cols-3 gap-2">
            {months.map((m, i) => {
               const mStr = (i + 1).toString().padStart(2, '0');
               const isSelected = value === `${year}-${mStr}`;
               return (
                 <button 
                   key={m} 
                   onClick={() => { onChange(`${year}-${mStr}`); setOpen(false); }}
                   className={`py-2.5 rounded-lg text-sm transition-colors ${isSelected ? 'bg-celeste-kore text-white font-bold shadow-md shadow-celeste-kore/20' : 'hover:bg-slate-100 dark:hover:bg-[#2A2A2E] text-slate-700 dark:text-gray-300'}`}
                 >
                   {m}
                 </button>
               );
            })}
         </div>
      </PopoverContent>
    </Popover>
  );
}

export function FinanzasDashboard() {
  const { data: flujoCaja, isLoading, isError, error } = useFlujoCaja();
  const anularGastoMutation = useAnularGasto();
  const anularIngresoMutation = useAnularIngreso();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMovimiento, setFilterMovimiento] = useState<"todos" | "ingreso" | "egreso">("todos");
  const [isCrearModalOpen, setIsCrearModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<"ingreso" | "gasto">("gasto");
  
  const [mounted] = useState(() => typeof window !== "undefined");
  
  // Date filter state
  const [filterPeriod, setFilterPeriod] = useState<"dia" | "mes" | "rango">("mes");
  const [dateDia, setDateDia] = useState(new Date().toISOString().split('T')[0]);
  const [dateMes, setDateMes] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [dateRango, setDateRango] = useState({ start: new Date().toISOString().slice(0, 10), end: new Date().toISOString().slice(0, 10) });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 1. Filtrar por fecha
  const dateFilteredData = useMemo(() => {
    if (!flujoCaja) return [];
    return flujoCaja.filter(item => {
       const itemDate = new Date(item.fecha);
       
       if (filterPeriod === "dia") {
         const targetDate = new Date(dateDia + "T00:00:00");
         return itemDate.getFullYear() === targetDate.getFullYear() &&
                itemDate.getMonth() === targetDate.getMonth() &&
                itemDate.getDate() === targetDate.getDate();
       } 
       else if (filterPeriod === "mes") {
         const [y, m] = dateMes.split('-');
         return itemDate.getFullYear() === parseInt(y) && 
                itemDate.getMonth() === (parseInt(m) - 1);
       }
       else if (filterPeriod === "rango") {
         const start = new Date(dateRango.start + "T00:00:00").getTime();
         const end = new Date(dateRango.end + "T23:59:59").getTime();
         const t = itemDate.getTime();
         return t >= start && t <= end;
       }
       return true;
    });
  }, [flujoCaja, filterPeriod, dateDia, dateMes, dateRango]);

  // 2. Métricas basadas en la fecha seleccionada (excluye registros anulados)
  const metricas = useMemo(() => {
    let ingresos = 0;
    let egresos = 0;

    dateFilteredData.forEach(item => {
      // Excluir registros anulados del cálculo de métricas
      if (item.estado === "anulado") return;

      const amt = Number(item.monto) || 0;
      if (item.tipo_movimiento === "ingreso") {
        ingresos += amt;
      } else {
        egresos += amt;
      }
    });

    return { ingresos, egresos, balance: ingresos - egresos };
  }, [dateFilteredData]);

  // 3. Calcular saldos progresivos (excluye anulados del cálculo de saldo)
  const flujoConSaldo = useMemo(() => {
    // Clonar e invertir (viene descendente, lo pasamos a ascendente)
    const asc = [...dateFilteredData].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    let current = 0;
    const withSaldo = [];
    for (const item of asc) {
      if (item.estado === "anulado") {
        withSaldo.push({ ...item, saldo: current });
      } else {
        const amt = Number(item.monto) || 0;
        if (item.tipo_movimiento === "ingreso") current += amt;
        else current -= amt;
        withSaldo.push({ ...item, saldo: current });
      }
    }
    
    // Regresar a descendente para mostrar
    return withSaldo.reverse();
  }, [dateFilteredData]);

  // Filtrado final
  const filteredData = useMemo(() => {
    let result = flujoConSaldo;
    
    if (filterMovimiento !== "todos") {
      result = result.filter(item => item.tipo_movimiento === filterMovimiento);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.descripcion?.toLowerCase().includes(term) || 
        item.categoria?.toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [flujoConSaldo, filterMovimiento, searchTerm]);

  // Restablecer la página a 1 cuando cambian los filtros
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [filteredData.length, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleAnular = async (id: string, descripcion: string, tipoMovimiento: string) => {
    const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");

    const result = await Swal.fire({
      title: '¿Anular este registro?',
      text: `Se anulará "${descripcion}". El registro permanecerá visible pero no afectará los totales.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: isDark ? '#2A2A2E' : '#71717a',
      background: isDark ? '#161618' : '#ffffff',
      color: isDark ? '#ffffff' : '#1e293b',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        if (tipoMovimiento === "ingreso") {
          await anularIngresoMutation.mutateAsync(id);
        } else {
          await anularGastoMutation.mutateAsync(id);
        }
        toast.success("Registro anulado exitosamente");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al anular registro";
        toast.error(msg);
      }
    }
  };

  const formatCurrency = (val: number) => {
    return `Q ${Math.abs(val).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`;
  };

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500 bg-[#161618] rounded-2xl border border-[#2A2A2E]">
        <Activity className="mx-auto h-12 w-12 mb-4 text-red-400" />
        <h3 className="text-lg font-medium text-white">Error al cargar finanzas</h3>
        <p className="text-sm mt-2 text-gray-400">{error?.message || "Intenta recargar la página."}</p>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-celeste-kore" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 pt-32 pb-8 md:px-4 md:pt-28 space-y-8 text-slate-900 dark:text-white font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-4xl font-black tracking-tight mt-0.5 sm:mt-1 leading-none uppercase">
              CONTROL <span className="text-destructive">FINANCIERO</span>
            </h1>
          </div>
        </div>
        <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setModalTipo("ingreso");
              setIsCrearModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full transition-all text-sm font-semibold tracking-wide"
          >
            + Ingreso
          </button>
          <button
            onClick={() => {
              setModalTipo("gasto");
              setIsCrearModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full transition-all text-sm font-semibold tracking-wide"
          >
            + Egreso
          </button>
        </div>
      </div>

      {/* ── Panel de métricas + filtros + gráfica ─────────────────────── */}
      <div className="bg-white dark:bg-[#161618] border border-slate-200 dark:border-[#2A2A2E] rounded-2xl p-4 sm:p-6 flex flex-col gap-5 shadow-sm">

        {/* Metrics Cards */}
        <div className="grid grid-cols-3 gap-2.5 md:gap-4">
          
          {/* Card 1: Ingresos */}
          <motion.div
            whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.35)", boxShadow: "0 10px 30px -10px rgba(16,185,129,0.08)" }}
            className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#212124] dark:to-[#1a1a1d] border border-slate-200 dark:border-[#2A2A2E] rounded-2xl p-3 sm:p-5 flex flex-col justify-between h-[115px] sm:h-[135px] transition-all duration-300 cursor-pointer shadow-sm w-full"
          >
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
              <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Total Ingresos</span>
              {isLoading ? (
                <Skeleton className="h-6 w-16 sm:w-32 bg-slate-100 dark:bg-[#2A2A2E] mt-1" />
              ) : (
                <div className="text-[13px] sm:text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5 sm:mt-1">
                  {formatCurrency(metricas.ingresos)}
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 2: Egresos */}
          <motion.div
            whileHover={{ y: -4, borderColor: "rgba(244,63,94,0.35)", boxShadow: "0 10px 30px -10px rgba(244,63,94,0.08)" }}
            className="bg-gradient-to-br from-white to-slate-50/50 dark:from-[#212124] dark:to-[#1a1a1d] border border-slate-200 dark:border-[#2A2A2E] rounded-2xl p-3 sm:p-5 flex flex-col justify-between h-[115px] sm:h-[135px] transition-all duration-300 cursor-pointer shadow-sm w-full"
          >
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 w-fit">
              <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Total Egresos</span>
              {isLoading ? (
                <Skeleton className="h-6 w-16 sm:w-32 bg-slate-100 dark:bg-[#2A2A2E] mt-1" />
              ) : (
                <div className="text-[13px] sm:text-xl md:text-2xl font-black text-rose-600 dark:text-rose-500 tracking-tight mt-0.5 sm:mt-1">
                  {formatCurrency(metricas.egresos)}
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 3: Balance Total */}
          <motion.div
            whileHover={{ y: -4, borderColor: "rgba(183,73,78,0.45)", boxShadow: "0 10px 30px -10px rgba(183,73,78,0.12)" }}
            className="bg-gradient-to-br from-white to-[#fff9f9] dark:from-[#1c1213] dark:to-[#121214] border border-celeste-kore/20 dark:border-celeste-kore/30 rounded-2xl p-3 sm:p-5 flex flex-col justify-between h-[115px] sm:h-[135px] transition-all duration-300 relative overflow-hidden cursor-pointer shadow-sm w-full"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-celeste-kore/5 rounded-full blur-2xl pointer-events-none" />
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 w-fit">
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">Balance Total</span>
              {isLoading ? (
                <Skeleton className="h-6 w-16 sm:w-32 bg-slate-100 dark:bg-[#2A2A2E] mt-1" />
              ) : (
                <div className="text-[13px] sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 sm:mt-1">
                  {metricas.balance < 0 ? "-" : ""}{formatCurrency(metricas.balance)}
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Filtros de Fecha */}
        <div className="flex items-center justify-center gap-2 text-sm font-medium flex-wrap w-full">
          <div className="flex bg-slate-50 dark:bg-[#212124] border border-slate-200 dark:border-[#2A2A2E] rounded-lg overflow-hidden shrink-0">
            <button 
              onClick={() => setFilterPeriod("dia")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${filterPeriod === "dia" ? "bg-celeste-kore/10 text-celeste-kore font-black" : "hover:bg-slate-100 dark:hover:bg-[#2A2A2E] text-slate-500 dark:text-gray-400"}`}
            >Día</button>
            <button 
              onClick={() => setFilterPeriod("mes")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-l border-slate-200 dark:border-[#2A2A2E] ${filterPeriod === "mes" ? "bg-celeste-kore/10 text-celeste-kore font-black" : "hover:bg-slate-100 dark:hover:bg-[#2A2A2E] text-slate-500 dark:text-gray-400"}`}
            >Mes</button>
            <button 
              onClick={() => setFilterPeriod("rango")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-l border-slate-200 dark:border-[#2A2A2E] ${filterPeriod === "rango" ? "bg-celeste-kore/10 text-celeste-kore font-black" : "hover:bg-slate-100 dark:hover:bg-[#2A2A2E] text-slate-500 dark:text-gray-400"}`}
            >Rango</button>
          </div>

          {filterPeriod === "dia" && (
            <div className="flex items-center justify-center w-full sm:w-auto mt-2 sm:mt-0">
              <CustomDatePicker value={dateDia} onChange={setDateDia} align="center" />
            </div>
          )}

          {filterPeriod === "mes" && (
            <div className="flex items-center justify-center w-full sm:w-auto mt-2 sm:mt-0">
              <CustomMonthPicker value={dateMes} onChange={setDateMes} />
            </div>
          )}

          {filterPeriod === "rango" && (
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <CustomDatePicker 
                value={dateRango.start} 
                onChange={(v) => setDateRango(prev => ({ ...prev, start: v }))} 
                align="start"
              />
              <span className="text-slate-400 dark:text-gray-500 font-bold">-</span>
              <CustomDatePicker 
                value={dateRango.end} 
                onChange={(v) => setDateRango(prev => ({ ...prev, end: v }))} 
                align="end"
              />
            </div>
          )}
        </div>

        {/* Chart: Ingresos vs Egresos */}
        <FinanzasChart
          data={(flujoCaja as unknown as FlujoCajaItem[]) ?? []}
          filterPeriod={filterPeriod}
          dateDia={dateDia}
          dateMes={dateMes}
          dateRango={dateRango}
        />

      </div>{/* fin panel */}

      {/* Toolbar - Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#161618] p-3 rounded-2xl border border-slate-200 dark:border-[#2A2A2E]">
        <div className="relative w-full sm:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por concepto o categoría..."
            className="pl-11 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-transparent focus:border-celeste-kore/50 bg-slate-50 dark:bg-[#212124] focus:outline-none focus:ring-1 focus:ring-celeste-kore/30 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>        <div className="flex items-center bg-slate-50 dark:bg-[#212124] border border-slate-200 dark:border-transparent rounded-xl p-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMovimiento("todos")}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all border ${filterMovimiento === "todos" ? "bg-celeste-kore/10 text-celeste-kore border-celeste-kore/30 shadow-sm" : "border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300"}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterMovimiento("ingreso")}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all border ${filterMovimiento === "ingreso" ? "bg-celeste-kore/10 text-celeste-kore border-celeste-kore/30 shadow-sm" : "border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300"}`}
          >
            Ingreso
          </button>
          <button
            onClick={() => setFilterMovimiento("egreso")}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all border ${filterMovimiento === "egreso" ? "bg-celeste-kore/10 text-celeste-kore border-celeste-kore/30 shadow-sm" : "border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300"}`}
          >
            Egreso
          </button>
        </div>
      </div>

      {/* Cards List Container */}
      <div className="bg-white dark:bg-[#161618] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#2A2A2E] w-full">
        <div className="flex flex-col gap-3.5 w-full">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-slate-50 dark:bg-[#212124] rounded-xl border border-slate-200 dark:border-[#2A2A2E] p-4 flex flex-col gap-3 shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-[#2A2A2E] shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 bg-slate-100 dark:bg-[#2A2A2E]" />
                  <Skeleton className="h-3.5 w-28 bg-slate-100 dark:bg-[#2A2A2E]" />
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-[#2A2A2E]" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 bg-slate-100 dark:bg-[#2A2A2E]" />
                <Skeleton className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-[#2A2A2E]" />
              </div>
            </div>
          ))
        ) : paginatedData.length === 0 ? (
          <div className="bg-slate-50 dark:bg-[#212124] rounded-xl border border-slate-200 dark:border-[#2A2A2E] p-12 text-center text-slate-500 dark:text-gray-400 font-medium">
            No se encontraron registros.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 w-full">
            <AnimatePresence>
              {paginatedData.map((item, idx) => {
                const isIngreso = item.tipo_movimiento === "ingreso";
                const isAnulado = item.estado === "anulado";
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isAnulado ? 0.55 : 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`bg-slate-50 dark:bg-[#212124] rounded-xl border p-4 flex flex-col gap-3 shadow-sm transition-all ${
                      isAnulado 
                        ? 'border-amber-500/30 dark:border-amber-500/20' 
                        : isIngreso 
                          ? 'border-emerald-500/40 dark:border-emerald-500/30 hover:border-emerald-500/60 dark:hover:border-emerald-500/50' 
                          : 'border-rose-500/40 dark:border-rose-500/30 hover:border-rose-500/60 dark:hover:border-rose-500/50'
                    }`}
                  >
                    {/* Card Content */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-extrabold text-xs uppercase line-clamp-2 leading-snug pr-2 ${isAnulado ? 'line-through text-slate-400 dark:text-gray-500' : 'text-slate-800 dark:text-white'}`}>
                            {item.descripcion}
                          </h4>
                          <span className={`font-black text-sm shrink-0 tracking-tight ${
                            isAnulado 
                              ? 'line-through text-slate-400 dark:text-gray-500' 
                              : isIngreso 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-rose-600 dark:text-rose-500'
                          }`}>
                            {isIngreso ? '+' : '-'}{formatCurrency(Number(item.monto))}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-gray-500 font-medium">
                            {new Date(item.fecha).toLocaleString("es-GT", { 
                              day: '2-digit', month: 'short', year: 'numeric', 
                              hour: '2-digit', minute: '2-digit' 
                            })}
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isAnulado && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase border border-amber-500/20">
                                Anulado
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-slate-100 dark:bg-[#212124] text-slate-500 dark:text-gray-400 uppercase">
                              {item.categoria || "Sin categoría"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menú de opciones */}
                      {!isAnulado && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg text-slate-400 dark:text-gray-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#3A3A3E] transition-all shrink-0 focus:outline-none">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 border-slate-200 dark:border-[#2A2A2E] bg-white dark:bg-[#161618] rounded-xl shadow-lg p-1">
                            <DropdownMenuItem 
                              onClick={() => handleAnular(item.id, item.descripcion, item.tipo_movimiento)}
                              disabled={anularGastoMutation.isPending || anularIngresoMutation.isPending}
                              className="text-rose-600 dark:text-rose-500 focus:text-rose-600 dark:focus:text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-500/10 font-bold text-xs cursor-pointer gap-2 rounded-lg py-2"
                            >
                              {(anularGastoMutation.isPending || anularIngresoMutation.isPending) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                              Anular
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex flex-row items-center justify-between p-4 bg-white dark:bg-[#161618] rounded-2xl border border-slate-200 dark:border-[#2A2A2E] gap-4 shadow-sm w-full">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400">
            <Select 
              value={String(itemsPerPage)} 
              onValueChange={(val) => {
                setItemsPerPage(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="bg-white dark:bg-[#161618] border border-slate-200 dark:border-[#2A2A2E] text-slate-800 dark:text-white h-9 px-3 rounded-lg focus:ring-1 focus:ring-celeste-kore/50 cursor-pointer outline-none">
                <SelectValue placeholder={String(itemsPerPage)} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#161618] border border-slate-200 dark:border-[#2A2A2E] text-slate-800 dark:text-white rounded-lg shadow-xl z-50">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#212124] text-slate-400 dark:text-gray-400 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-slate-800 dark:text-white px-2">
                {currentPage} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#212124] text-slate-400 dark:text-gray-400 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      <CrearGastoModal 
        isOpen={isCrearModalOpen} 
        onClose={() => setIsCrearModalOpen(false)} 
        tipo={modalTipo}
      />
    </div>
  );
}
