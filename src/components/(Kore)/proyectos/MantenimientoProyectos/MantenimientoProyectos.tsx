"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { 
  getProyectos, 
} from "@/components/(Kore)/proyectos/lib/actions";
import { Proyecto } from "@/components/(Kore)/proyectos/lib/zod";

import { cn } from "@/lib/utils";

// Components
import { PagoMantenimientoModal } from "@/components/(Kore)/proyectos/forms/PagoMantenimientoModal";
import { useUserContext } from "@/components/(base)/providers/UserProvider";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return null;
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

function formatCobroDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr.split("T")[0] + "T09:00:00");
    if (isNaN(d.getTime())) return "—";
    
    const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const wDay = weekdays[d.getDay()];
    
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    
    return `${wDay} ${day}/${month}/${year}`;
  } catch {
    return "—";
  }
}

function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return "";
  const clean = phone.trim();
  if (!clean) return "";
  const cleanNoSpaces = clean.replace(/\s+/g, "");
  const gtMatch = cleanNoSpaces.match(/^(?:\+?502)?(\d{4})(\d{4})$/);
  if (gtMatch) {
    return `${gtMatch[1]}-${gtMatch[2]}`;
  }
  return clean;
}

function formatWhatsAppLink(phone: string | null | undefined): string {
  if (!phone) return "";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 8) {
    return `502${clean}`;
  }
  return clean;
}

function formatMoney(val: number): string {
  return new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(val);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MantenimientoProyectos() {
  const router = useRouter();
  const { effectiveRole } = useUserContext();
  const isDeveloper = effectiveRole === "proyectos";

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  // Modal state
  const [pagoModalProyecto, setPagoModalProyecto] = useState<Proyecto | null>(null);

  // Role guard
  useEffect(() => {
    if (!["super", "admin", "proyectos"].includes(effectiveRole)) {
      router.replace("/kore");
    }
  }, [effectiveRole, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProyectos();
      setProyectos(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived data
  const activeProyectos = proyectos.filter(p => p.aplica_mantenimiento || p.mantenimiento > 0);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 text-foreground px-2 pt-32 pb-8 md:px-4 md:pt-28 relative overflow-x-hidden">
      {/* Decorative glow */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-celeste-kore/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-4xl font-black tracking-tight mt-0.5 sm:mt-1 leading-none">
            GESTIÓN DE <br className="hidden sm:block" />
            <span className="text-celeste-kore">MANTENIMIENTO</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5 font-medium tracking-wider uppercase">
            Proyectos con cobro mensual activo
          </p>
        </div>

      </div>



      {/* ── TABLE ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-celeste-kore/55 dark:border-border bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-none dark:shadow-2xl dark:shadow-black/20 overflow-hidden">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border/50">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <Wrench size={16} className="text-red-500" />
          </div>
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-foreground/90">
            Proyectos con Mantenimiento
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <RefreshCw size={18} className="text-amber-400 animate-spin" />
            <span className="text-sm text-muted-foreground font-medium">Cargando proyectos...</span>
          </div>
        ) : activeProyectos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/40">
              <Wrench size={32} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">Sin proyectos con mantenimiento</p>
            <p className="text-xs text-muted-foreground/60 max-w-xs">
              Los proyectos aparecen aquí cuando tienen una deducción de tipo &quot;Mantenimiento&quot; registrada.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card">
            <table className="w-full text-left border-collapse">
              <thead className="bg-celeste-kore/10 dark:bg-celeste-kore/20 border-b border-border/50">
                <tr className="text-[10px] text-celeste-kore dark:text-white uppercase tracking-[0.15em]">
                  <th className="py-4 px-4 font-black w-[45%] sm:w-[35%]">Proyecto</th>
                  <th className="py-4 px-4 font-black sm:w-[30%]">Cliente</th>
                  <th className="py-4 px-4 font-black text-right w-[25%] sm:w-[20%]">Monto</th>
                  {!isDeveloper && (
                    <th className="py-4 px-4 font-black text-right w-[15%]">Acción</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {activeProyectos.map((p, idx) => {
                    const pct = Number(p.monto_mantenimiento) || Number(p.mantenimiento) || 0;
                    const montoMensual = p.monto_mensual_fijo ? Number(p.monto_mensual_fijo) : ((Number(p.precio) || 0) * pct / 100);
                    const days = getDaysUntil(p.mantenimiento_fecha_cobro);

                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={cn(
                          "border-b border-border/50 last:border-0 hover:bg-muted/30 even:bg-muted/10 odd:bg-transparent transition-colors group",
                          (days !== null && days <= 0) 
                            ? "border border-yellow-500 animate-pulse bg-yellow-500/5 shadow-[inset_0_0_15px_rgba(234,179,8,0.2)]" 
                            : "",
                          !isDeveloper ? "cursor-pointer" : "cursor-default"
                        )}
                        onClick={() => {
                          if (!isDeveloper) {
                            setPagoModalProyecto(p);
                          }
                        }}
                      >
                        {/* Project */}
                        <td className="px-4 py-4">
                          <p className="text-xs font-bold text-foreground leading-none group-hover:text-celeste-kore transition-colors">{p.nombre}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 select-none font-bold">
                            Próximo cobro: {formatCobroDate(p.mantenimiento_fecha_cobro)}
                          </p>
                        </td>

                        {/* Client */}
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <p className="text-xs font-bold text-foreground/80 leading-none">{p.cliente_nombre || "—"}</p>
                          {p.cliente_telefono && (
                            <a
                              href={`https://wa.me/${formatWhatsAppLink(p.cliente_telefono)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-celeste-kore hover:underline font-semibold block mt-1"
                            >
                              {formatPhoneDisplay(p.cliente_telefono)}
                            </a>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-4 text-right">
                          <div>
                            <p className="text-xs font-bold text-emerald-400">{formatMoney(montoMensual)}</p>
                            <p className="text-[9px] text-muted-foreground">
                              {p.monto_mensual_fijo ? "Monto Fijo" : `${pct}% mensual`}
                            </p>
                          </div>
                        </td>



                        {!isDeveloper && (
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setPagoModalProyecto(p); }}
                                className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-md"
                              >
                                <DollarSign size={12} /> PAGO
                              </button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {pagoModalProyecto && (
          <PagoMantenimientoModal
            proyecto={proyectos.find(p => p.id === pagoModalProyecto.id) || pagoModalProyecto}
            onClose={() => setPagoModalProyecto(null)}
            onSuccess={() => {
              fetchData();
            }}
          />
        )}
      </AnimatePresence>


    </div>
  );
}
