"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronDown } from "lucide-react";
import { 
  registrarPagoMantenimiento, 
  getMantenimientoHistorial, 
  eliminarPagoMantenimiento 
} from "@/components/(Kore)/proyectos/lib/actions";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import { 
  ModalShell, 
  ModalFooter, 
  ModalSubmit,
  ModalConfirmDelete 
} from "@/components/ui/general-modal";

interface PagoMantenimientoModalProps {
  proyecto: any;
  onClose: () => void;
  onSuccess: () => void;
}

const getMaintenanceBaseStartDate = (proyecto: any, paymentsList: any[]) => {
  let baseDateStr = proyecto.mantenimiento_fecha_cobro || proyecto.otros_campos?.mantenimiento_fecha_cobro;
  
  if (!baseDateStr) {
    baseDateStr = proyecto.fecha_entrega;
  }
  
  if (!baseDateStr) return null;
  
  let baseDate = new Date(baseDateStr.split("T")[0] + "T00:00:00");
  if (isNaN(baseDate.getTime())) return null;

  for (const p of paymentsList) {
    if (p.periodo_pagado) {
      const parts = p.periodo_pagado.split("-");
      if (parts.length === 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; 
        
        if (year < baseDate.getFullYear() || (year === baseDate.getFullYear() && month < baseDate.getMonth())) {
          baseDate = new Date(year, month, baseDate.getDate());
        }
      }
    }
  }
  
  return baseDate;
};

const calculateNextCobroDate = (baseStartDate: Date | null, paidPeriods: string[]) => {
  if (!baseStartDate) return null;

  let current = new Date(baseStartDate);

  for (let i = 0; i < 120; i++) {
    const periodKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    if (!paidPeriods.includes(periodKey)) {
      const targetDate = new Date(current.getFullYear(), current.getMonth(), baseStartDate.getDate(), 12, 0, 0);
      return targetDate.toISOString();
    }
    current.setMonth(current.getMonth() + 1);
  }
  return null;
};

const formatPaymentDateWithTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    
    const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const wDay = weekdays[d.getDay()];
    
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const strTime = `${String(hours).padStart(2, "0")}:${minutes}${ampm}`;
    
    return `${wDay} ${day}/${month}/${year} | ${strTime}`;
  } catch {
    return "—";
  }
};

const parsePaymentDescription = (desc: string | null | undefined) => {
  if (!desc) return { cleanDesc: "", username: "Usuario" };
  const parts = desc.split(" | Confirmado por: ");
  
  let username = "Usuario";
  if (parts.length > 1) {
    username = parts[1].trim();
    const nameParts = username.split(/\s+/);
    if (nameParts.length >= 4) {
      // Asume Nombre1 Nombre2 Apellido1 Apellido2
      username = `${nameParts[0]} ${nameParts[2]}`;
    } else if (nameParts.length === 3) {
      // Asume Nombre Apellido1 Apellido2 o similar
      username = `${nameParts[0]} ${nameParts[1]}`;
    }
  }
  
  return { cleanDesc: parts[0], username };
};

export function PagoMantenimientoModal({ proyecto, onClose, onSuccess }: PagoMantenimientoModalProps) {
  const pct = Number(proyecto.monto_mantenimiento) || Number(proyecto.mantenimiento) || 0;
  const sugerido = proyecto.monto_mensual_fijo 
    ? Number(proyecto.monto_mensual_fijo) 
    : ((Number(proyecto.precio) || 0) * pct / 100);

  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const baseStartDate = getMaintenanceBaseStartDate(proyecto, payments);
  const startYear = baseStartDate ? baseStartDate.getFullYear() : null;
  const startMonth = baseStartDate ? baseStartDate.getMonth() : null;

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const hist = await getMantenimientoHistorial(proyecto.id);
      setPayments(hist || []);
    } catch (err) {
      console.error("Error loading payments:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [proyecto.id, selectedYear]);

  const handleToggleMonth = async (monthIndex: number, monthName: string) => {
    if (loading) return;

    const periodKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`;
    const existingPayment = payments.find(p => p.periodo_pagado === periodKey);
    const isDark = typeof window !== "undefined" && document.documentElement.classList.contains("dark");

    if (existingPayment) {
      // Confirm Delete
      const result = await Swal.fire({
        title: "¿Anular pago?",
        html: `¿Deseas anular el registro de pago para ${monthName} de ${selectedYear}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: isDark ? "#27272a" : "#71717a",
        background: isDark ? "#161618" : "#ffffff",
        color: isDark ? "#ffffff" : "#1e293b",
        confirmButtonText: "Sí, anular",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        setLoading(true);
        const otherPayments = payments.filter(p => p.id !== existingPayment.id).map(p => p.periodo_pagado);
        const newProximaFecha = calculateNextCobroDate(baseStartDate, otherPayments);
        
        const res = await eliminarPagoMantenimiento(existingPayment.id, proyecto.id, newProximaFecha);
        setLoading(false);

        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Pago anulado correctamente");
          fetchHistory();
          onSuccess();
        }
      }
    } else {
      // Confirm Register
      const result = await Swal.fire({
        title: "¿Registrar pago?",
        html: `Se marcará como pagado <strong>${monthName} de ${selectedYear}</strong> por <strong>${formatMoney(sugerido)}</strong>.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#22c55e", // green-500 equivalent color
        cancelButtonColor: isDark ? "#27272a" : "#71717a",
        background: isDark ? "#161618" : "#ffffff",
        color: isDark ? "#ffffff" : "#1e293b",
        confirmButtonText: "Sí, registrar",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        setLoading(true);
        const allPayments = [...payments.map(p => p.periodo_pagado), periodKey];
        const newProximaFecha = calculateNextCobroDate(baseStartDate, allPayments);

        const res = await registrarPagoMantenimiento(
          proyecto.id,
          sugerido,
          new Date().toISOString(),
          periodKey,
          `Pago de mantenimiento de ${monthName} ${selectedYear}`,
          newProximaFecha
        );
        setLoading(false);

        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Pago registrado correctamente");
          fetchHistory();
          onSuccess();
        }
      }
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(val);
  };

  return (
    <ModalShell
      isOpen={true}
      onClose={onClose}
      title="Registrar Pago"
      subtitle={proyecto.nombre}
      maxWidth="5xl"
      footer={
        <ModalFooter>
          <ModalSubmit text="Cerrar" onClick={onClose} type="button" />
        </ModalFooter>
      }
    >
      <div className="flex flex-col gap-6 h-full">
        {/* Year Picker Panel */}
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground select-none">Año de Pago</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="h-8 sm:h-9 flex items-center justify-center gap-1.5 px-4 bg-muted/20 border border-border/40 rounded-xl font-black uppercase tracking-widest text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <span>{selectedYear}</span>
              <ChevronDown size={10} className="text-muted-foreground shrink-0" />
            </button>

            <AnimatePresence>
              {showYearDropdown && (
                <>
                  <motion.div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setShowYearDropdown(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-[140px] bg-zinc-100 dark:bg-zinc-800 border border-border/10 rounded-2xl shadow-xl p-3 flex flex-col gap-1.5"
                    initial={{ opacity: 0, scale: 0.92, y: -8, x: "-50%" }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, scale: 0.92, y: -8, x: "-50%" }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    style={{ left: "50%", originX: 0.5, originY: 0 }}
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((y) => {
                      const isSelected = selectedYear === y;
                      return (
                        <motion.button
                          key={y}
                          type="button"
                          onClick={() => {
                            setSelectedYear(y);
                            setShowYearDropdown(false);
                          }}
                          whileHover={{ scale: 1.04, x: 2 }}
                          whileTap={{ scale: 0.96 }}
                          className={cn(
                            "w-full py-1.5 text-center text-xs font-black rounded-lg transition-all cursor-pointer",
                            isSelected
                              ? "bg-celeste-kore text-white shadow-md"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          )}
                        >
                          {y}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>



        {/* Months Grid */}
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <RefreshCw size={24} className="animate-spin text-celeste-kore" />
            <span className="text-[10px] font-black uppercase tracking-widest">Cargando Historial...</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 flex-1">
            {months.map((m, idx) => {
              const periodKey = `${selectedYear}-${String(idx + 1).padStart(2, "0")}`;
              const isBeforeStart = startYear !== null && startMonth !== null && (
                selectedYear < startYear || (selectedYear === startYear && idx < startMonth)
              );
              const payment = payments.find(p => p.periodo_pagado === periodKey);
              const isPaid = !!payment;

              return (
                <motion.button
                  key={m}
                  type="button"
                  disabled={isBeforeStart || loading}
                  onClick={() => handleToggleMonth(idx, m)}
                  whileHover={{ scale: isBeforeStart ? 1 : 1.05 }}
                  whileTap={{ scale: isBeforeStart ? 1 : 0.95 }}
                  className={cn(
                    "py-2 px-1 rounded-xl border flex flex-col items-center transition-all h-full min-h-[105px] text-center relative overflow-hidden select-none",
                    isBeforeStart
                      ? "bg-red-500/5 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-400 dark:text-red-500 cursor-not-allowed justify-center"
                      : isPaid
                        ? "bg-green-500/10 border-green-500/40 text-green-500 font-black"
                        : "bg-yellow-500/10 dark:bg-yellow-500/5 border-yellow-500/30 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/20 hover:border-yellow-500/50 cursor-pointer justify-center"
                  )}
                >
                  <div className="flex-1 flex flex-col items-center justify-center gap-1">
                    <span className="text-sm sm:text-base font-black uppercase tracking-wider leading-none">{m.slice(0, 3)}</span>
                    
                    {isBeforeStart && (
                      <span className="text-[10px] sm:text-xs font-bold text-red-400/80 dark:text-red-500/80 uppercase tracking-widest leading-none mt-1">N/A</span>
                    )}
                    {isPaid && (
                      <span className="text-[10px] sm:text-[11px] font-black bg-green-500/20 text-green-500 px-2 py-1 rounded uppercase tracking-widest leading-none mt-1">Pagado</span>
                    )}
                    {!isBeforeStart && !isPaid && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest leading-none mt-1">Pendiente</span>
                    )}
                  </div>

                  {isPaid && (
                    <div className="flex flex-col items-center w-full mb-1 border-t border-green-500/25 pt-1.5 mt-auto">
                      <span className="text-[9px] sm:text-[10px] font-medium leading-tight text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis w-full px-1">
                        {formatPaymentDateWithTime(payment.fecha_pago)}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold leading-tight text-foreground whitespace-nowrap overflow-hidden text-ellipsis w-full px-1 mt-0.5">
                        {parsePaymentDescription(payment.descripcion).username}
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Legends */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 pb-2 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-muted-foreground select-none mt-auto">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-red-500/10 border border-red-500/40"></div>
            <span>No aplica</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-green-500/20 border border-green-500"></div>
            <span>Pagado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-yellow-500/20 border border-yellow-500"></div>
            <span>Pendiente</span>
          </div>
        </div>
      </div>
      
    </ModalShell>
  );
}
