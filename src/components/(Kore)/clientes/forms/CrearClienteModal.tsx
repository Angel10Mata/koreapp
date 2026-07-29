"use client";

import { useState } from "react";
import { ModalShell } from "@/components/ui/general-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clienteSchema, ClienteFormValues } from "@/components/(Kore)/clientes/lib/zod";
import { useCreateCliente } from "@/components/(Kore)/clientes/lib/hooks";
import { Loader2, Save, X } from "lucide-react";
import { KorePhoneInput } from "@/components/ui/KorePhoneInput";

interface CrearClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCliente: any) => void;
  initialName?: string;
}

export function CrearClienteModal({ isOpen, onClose, onSuccess, initialName }: CrearClienteModalProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ClienteFormValues>({
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
          onClose();
        }
      },
      onError: () => {
        setLoading(false);
      }
    });
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Cliente"
      subtitle="Ingrese los datos del cliente"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre *</label>
            <input
              {...register("nombre")}
              className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600/50"
              placeholder="Nombre completo"
            />
            {errors.nombre && <p className="text-[10px] text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">NIT</label>
            <input
              {...register("nit")}
              className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600/50"
              placeholder="C/F"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teléfono</label>
            <KorePhoneInput
              value={watch("telefono") || ""}
              onChange={(val) => setValue("telefono", val)}
              placeholder="Número de teléfono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Correo Electrónico</label>
            <input
              {...register("correo")}
              type="email"
              className="flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600/50"
              placeholder="correo@ejemplo.com"
            />
            {errors.correo && <p className="text-[10px] text-destructive">{errors.correo.message}</p>}
          </div>
        </div>

        <div className="shrink-0 p-4 border-t border-border/40 bg-muted/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold bg-celeste-kore text-white hover:bg-celeste-kore/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Crear Cliente
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
