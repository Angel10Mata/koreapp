"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { finanzasSchema, GastoFormValues, ingresoSchema, IngresoFormValues } from "@/components/(Kore)/finanzas/lib/zod";
import { useCrearGasto, useCrearIngreso } from "@/components/(Kore)/finanzas/lib/hooks";
import { Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";

interface CrearGastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo?: "ingreso" | "gasto";
}

export function CrearGastoModal({ isOpen, onClose, tipo = "gasto" }: CrearGastoModalProps) {
  const isIngreso = tipo === "ingreso";

  const gastoForm = useForm<GastoFormValues>({
    resolver: zodResolver(finanzasSchema),
    defaultValues: { tipo: "", descripcion: "", monto: 0 },
  });

  const ingresoForm = useForm<IngresoFormValues>({
    resolver: zodResolver(ingresoSchema),
    defaultValues: { categoria: "", descripcion: "", monto: 0 },
  });

  const crearGastoMutation = useCrearGasto();
  const crearIngresoMutation = useCrearIngreso();
  const mutation = isIngreso ? crearIngresoMutation : crearGastoMutation;

  const onSubmitGasto = async (data: GastoFormValues) => {
    try {
      await crearGastoMutation.mutateAsync(data);
      toast.success("Gasto registrado exitosamente");
      gastoForm.reset();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al registrar";
      toast.error(msg);
    }
  };

  const onSubmitIngreso = async (data: IngresoFormValues) => {
    try {
      await crearIngresoMutation.mutateAsync(data);
      toast.success("Ingreso registrado exitosamente");
      ingresoForm.reset();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al registrar";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    gastoForm.reset();
    ingresoForm.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md mx-4 bg-[#161618] rounded-[24px] shadow-2xl overflow-hidden border border-white/5">
        
        <form 
          onSubmit={isIngreso 
            ? ingresoForm.handleSubmit(onSubmitIngreso) 
            : gastoForm.handleSubmit(onSubmitGasto)
          } 
          className="relative flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-2">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl border ${isIngreso ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-celeste-kore/20 bg-celeste-kore/10'} flex items-center justify-center`}>
                <span className={`text-xl font-black w-6 h-6 flex items-center justify-center ${isIngreso ? 'text-emerald-500' : 'text-celeste-kore'}`}>
                  Q
                </span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-widest ${isIngreso ? 'text-emerald-500/80' : 'text-celeste-kore/80'}`}>
                  Formulario de {isIngreso ? "Ingreso" : "Egreso"}
                </span>
                <h2 className="text-[22px] font-black text-white tracking-tight leading-none mt-1 uppercase">
                  NUEVO <span className={isIngreso ? 'text-emerald-500' : 'text-celeste-kore'}>{isIngreso ? "INGRESO" : "EGRESO"}</span>
                </h2>
              </div>
            </div>
          </div>

          <div className="w-full px-6 py-4">
            <div className="h-px w-full bg-white/5" />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
            <div className="space-y-5">
              
              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                  Descripción *
                </label>
                {isIngreso ? (
                  <input
                    {...ingresoForm.register("descripcion")}
                    className="flex h-11 w-full rounded-xl border border-white/5 bg-black/40 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all outline-none placeholder:text-gray-600"
                    placeholder="Ej. Pago de cliente extraordinario"
                  />
                ) : (
                  <input
                    {...gastoForm.register("descripcion")}
                    className="flex h-11 w-full rounded-xl border border-white/5 bg-black/40 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-celeste-kore/50 transition-all outline-none placeholder:text-gray-600"
                    placeholder="Ej. Pago de internet mensual"
                  />
                )}
                {isIngreso && ingresoForm.formState.errors.descripcion && (
                  <span className="text-[10px] text-red-500 font-semibold">{ingresoForm.formState.errors.descripcion.message}</span>
                )}
                {!isIngreso && gastoForm.formState.errors.descripcion && (
                  <span className="text-[10px] text-red-500 font-semibold">{gastoForm.formState.errors.descripcion.message}</span>
                )}
              </div>

              {/* Monto */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                  Monto *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Q</span>
                  {isIngreso ? (
                    <input
                      type="number"
                      step="0.01"
                      {...ingresoForm.register("monto", { valueAsNumber: true })}
                      className="flex h-11 w-full rounded-xl border border-white/5 bg-black/40 pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all outline-none placeholder:text-gray-600"
                      placeholder="0"
                    />
                  ) : (
                    <input
                      type="number"
                      step="0.01"
                      {...gastoForm.register("monto", { valueAsNumber: true })}
                      className="flex h-11 w-full rounded-xl border border-white/5 bg-black/40 pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-celeste-kore/50 transition-all outline-none placeholder:text-gray-600"
                      placeholder="0"
                    />
                  )}
                </div>
                {isIngreso && ingresoForm.formState.errors.monto && (
                  <span className="text-[10px] text-red-500 font-semibold">{ingresoForm.formState.errors.monto.message}</span>
                )}
                {!isIngreso && gastoForm.formState.errors.monto && (
                  <span className="text-[10px] text-red-500 font-semibold">{gastoForm.formState.errors.monto.message}</span>
                )}
              </div>

              {/* Categoría / Tipo */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                  Categoría *
                </label>
                {isIngreso ? (
                  <input
                    {...ingresoForm.register("categoria")}
                    className="flex h-11 w-full rounded-xl border border-white/5 bg-black/40 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all outline-none placeholder:text-gray-600"
                    placeholder="Ej. Consultoría, Venta directa"
                  />
                ) : (
                  <input
                    {...gastoForm.register("tipo")}
                    className="flex h-11 w-full rounded-xl border border-white/5 bg-black/40 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-celeste-kore/50 transition-all outline-none placeholder:text-gray-600"
                    placeholder="Ej. Servicios, Planilla"
                  />
                )}
                {isIngreso && ingresoForm.formState.errors.categoria && (
                  <span className="text-[10px] text-red-500 font-semibold">{ingresoForm.formState.errors.categoria.message}</span>
                )}
                {!isIngreso && gastoForm.formState.errors.tipo && (
                  <span className="text-[10px] text-red-500 font-semibold">{gastoForm.formState.errors.tipo.message}</span>
                )}
              </div>
              
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 pt-2 flex justify-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-11 rounded-xl border border-white/10 bg-transparent text-sm font-black text-white hover:bg-white/5 transition-colors uppercase tracking-wider"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`flex-1 h-11 rounded-xl ${isIngreso ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-celeste-kore hover:bg-celeste-kore/90'} text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
