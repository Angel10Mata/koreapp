"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clienteSchema, ClienteFormValues } from "@/components/(Kore)/clientes/lib/zod";
import { useCreateCliente } from "@/components/(Kore)/clientes/lib/hooks";
import { Loader2, Save, Users, Mail, ChevronDown, X } from "lucide-react";
import { KorePhoneInput } from "@/components/ui/KorePhoneInput";
import { AnimatePresence, motion } from "framer-motion";

interface CrearClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCliente: any) => void;
  initialName?: string;
}

export function CrearClienteModal({ isOpen, onClose, onSuccess, initialName }: CrearClienteModalProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: initialName || "",
      nit: "C/F",
      telefono: "",
      correo: "",
      departamento: "",
      municipio: "",
    },
  });

  const createMutation = useCreateCliente();
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ClienteFormValues) => {
    setLoading(true);
    createMutation.mutate(data, {
      onSuccess: (res) => {
        setLoading(false);
        if (!res.error) {
          onSuccess({
            nombre: data.nombre,
            nit: data.nit,
            telefono: data.telefono,
            correo: data.correo,
          });
          reset();
          onClose();
        }
      },
      onError: () => {
        setLoading(false);
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-2xl mx-4 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Gradient accent top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-celeste-kore/50 to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800/80 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-celeste-kore/10 flex items-center justify-center border border-celeste-kore/20 shrink-0">
                  <Users className="text-celeste-kore size-6" />
                </div>
                <div>
                  <h2 className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-primary/80">
                    Formulario de Cliente
                  </h2>
                  <h1 className="text-xl sm:text-3xl font-black tracking-tight mt-0.5 leading-none uppercase text-black dark:text-white">
                    NUEVO <span className="text-celeste-kore">CLIENTE</span>
                  </h1>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0 mt-0.5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                {/* Nombre Completo */}
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                    Nombre Completo *
                  </label>
                  <input
                    {...register("nombre")}
                    type="text"
                    placeholder="Ej. Angel Mata"
                    className={`flex h-11 w-full rounded-xl border bg-black/5 dark:bg-black/40 px-4 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 transition-all outline-none ${
                      errors.nombre
                        ? "border-destructive focus:ring-destructive/50"
                        : "border-input dark:border-white/10 focus:ring-red-600/50"
                    }`}
                  />
                  {errors.nombre && (
                    <p className="text-[10px] text-destructive font-semibold">{errors.nombre.message}</p>
                  )}
                </div>

                {/* NIT */}
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                    NIT
                  </label>
                  <input
                    {...register("nit")}
                    type="text"
                    placeholder="Ej. CF o 1234567-8"
                    className="flex h-11 w-full rounded-xl border border-input dark:border-white/10 bg-black/5 dark:bg-black/40 px-4 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all outline-none"
                  />
                </div>

                {/* Teléfono */}
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                    Teléfono de Contacto
                  </label>
                  <KorePhoneInput
                    value={watch("telefono") || ""}
                    onChange={(val) => setValue("telefono", val)}
                    placeholder="40001234"
                  />
                </div>

                {/* Correo */}
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                    <input
                      {...register("correo")}
                      type="email"
                      placeholder="ejemplo@correo.com"
                      className={`flex h-11 w-full rounded-xl border bg-black/5 dark:bg-black/40 pl-11 pr-4 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 transition-all outline-none ${
                        errors.correo
                          ? "border-destructive focus:ring-destructive/50"
                          : "border-input dark:border-white/10 focus:ring-red-600/50"
                      }`}
                    />
                  </div>
                  {errors.correo && (
                    <p className="text-[10px] text-destructive font-semibold">{errors.correo.message}</p>
                  )}
                </div>

              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 px-6 md:px-8 py-5 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/30">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl border border-border/40 text-sm font-black uppercase tracking-wider text-foreground hover:bg-muted/30 transition-all disabled:opacity-50"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-black uppercase tracking-wider bg-celeste-kore text-white hover:bg-celeste-kore/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-celeste-kore/20"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  REGISTRAR
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
