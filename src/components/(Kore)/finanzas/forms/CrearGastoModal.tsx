"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { finanzasSchema, GastoFormValues, ingresoSchema, IngresoFormValues } from "../lib/zod";
import { useCrearGasto, useCrearIngreso } from "../lib/hooks";
import { Loader2, Save, X, DollarSign, Tag, FileText } from "lucide-react";
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
    } catch (error: any) {
      toast.error(error.message || "Error al registrar");
    }
  };

  const onSubmitIngreso = async (data: IngresoFormValues) => {
    try {
      await crearIngresoMutation.mutateAsync(data);
      toast.success("Ingreso registrado exitosamente");
      ingresoForm.reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar");
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md mx-4 bg-[#1C1C1F] rounded-[24px] shadow-2xl overflow-hidden border border-gray-800">
        
        {/* Glow Effect */}
        <div className={`absolute top-0 left-0 w-64 h-64 bg-gradient-to-br ${isIngreso ? 'from-emerald-500/20 via-emerald-500/5' : 'from-celeste-kore/20 via-celeste-kore/5'} to-transparent blur-3xl pointer-events-none`} />

        <form 
          onSubmit={isIngreso 
            ? ingresoForm.handleSubmit(onSubmitIngreso) 
            : gastoForm.handleSubmit(onSubmitGasto)
          } 
          className="relative flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-[22px] font-extrabold text-white tracking-tight">
              {isIngreso ? "Registrar Ingreso" : "Registrar Gasto"}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X strokeWidth={2.5} className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full h-px bg-gray-800/50" />

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="space-y-5 px-1 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Descripción */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[13px] font-bold text-gray-300 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-celeste-kore" />
                    Descripción *
                  </label>
                  {isIngreso ? (
                    <input
                      {...ingresoForm.register("descripcion")}
                      className="w-full px-4 py-2.5 bg-[#1F2024] border border-gray-700/50 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-celeste-kore transition-colors placeholder:text-gray-500"
                      placeholder="Ej: Pago de cliente extraordinario"
                    />
                  ) : (
                    <input
                      {...gastoForm.register("descripcion")}
                      className="w-full px-4 py-2.5 bg-[#1F2024] border border-gray-700/50 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-celeste-kore transition-colors placeholder:text-gray-500"
                      placeholder="Ej: Pago de internet mensual"
                    />
                  )}
                  {isIngreso && ingresoForm.formState.errors.descripcion && (
                    <span className="text-xs text-red-500">{ingresoForm.formState.errors.descripcion.message}</span>
                  )}
                  {!isIngreso && gastoForm.formState.errors.descripcion && (
                    <span className="text-xs text-red-500">{gastoForm.formState.errors.descripcion.message}</span>
                  )}
                </div>

                {/* Monto */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-300 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    Monto *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                    {isIngreso ? (
                      <input
                        type="number"
                        step="0.01"
                        {...ingresoForm.register("monto", { valueAsNumber: true })}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#1F2024] border border-gray-700/50 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-gray-500"
                        placeholder="0"
                      />
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        {...gastoForm.register("monto", { valueAsNumber: true })}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#1F2024] border border-gray-700/50 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-gray-500"
                        placeholder="0"
                      />
                    )}
                  </div>
                  {isIngreso && ingresoForm.formState.errors.monto && (
                    <span className="text-xs text-red-500">{ingresoForm.formState.errors.monto.message}</span>
                  )}
                  {!isIngreso && gastoForm.formState.errors.monto && (
                    <span className="text-xs text-red-500">{gastoForm.formState.errors.monto.message}</span>
                  )}
                </div>

                {/* Categoría / Tipo */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-300 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-orange-500" />
                    Categoría *
                  </label>
                  {isIngreso ? (
                    <input
                      {...ingresoForm.register("categoria")}
                      className="w-full px-4 py-2.5 bg-[#1F2024] border border-gray-700/50 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors placeholder:text-gray-500"
                      placeholder="Ej: Consultoría, Venta directa"
                    />
                  ) : (
                    <input
                      {...gastoForm.register("tipo")}
                      className="w-full px-4 py-2.5 bg-[#1F2024] border border-gray-700/50 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors placeholder:text-gray-500"
                      placeholder="Ej: Servicios, Planilla"
                    />
                  )}
                  {isIngreso && ingresoForm.formState.errors.categoria && (
                    <span className="text-xs text-red-500">{ingresoForm.formState.errors.categoria.message}</span>
                  )}
                  {!isIngreso && gastoForm.formState.errors.tipo && (
                    <span className="text-xs text-red-500">{gastoForm.formState.errors.tipo.message}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-800/50" />

          {/* Footer */}
          <div className="p-5 flex justify-end items-center gap-4 bg-[#17181A]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`px-6 py-2.5 ${isIngreso ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20' : 'bg-celeste-kore hover:bg-celeste-kore/90 shadow-celeste-kore/20'} text-white text-sm rounded-xl shadow-lg transition-all font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {mutation.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
