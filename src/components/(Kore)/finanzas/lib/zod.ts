import { z } from "zod";

export const finanzasSchema = z.object({
  tipo: z.string().min(1, { message: "El tipo es requerido" }),
  descripcion: z.string().min(1, { message: "La descripción es requerida" }),
  monto: z.number({
    error: "El monto debe ser un número",
  }).positive({ message: "El monto debe ser mayor a 0" }),
});

export type GastoFormValues = z.infer<typeof finanzasSchema>;

export const ingresoSchema = z.object({
  categoria: z.string().min(1, { message: "La categoría es requerida" }),
  descripcion: z.string().min(1, { message: "La descripción es requerida" }),
  monto: z.number({
    error: "El monto debe ser un número",
  }).positive({ message: "El monto debe ser mayor a 0" }),
});

export type IngresoFormValues = z.infer<typeof ingresoSchema>;

export interface DBGasto {
  id: string;
  tipo: string;
  descripcion: string;
  monto: number;
  usuario_id: string;
  fecha: string;
  estado: string;
  created_at: string;
}

export interface DBFlujoCaja {
  id: string;
  tipo_movimiento: string; // 'egreso', 'ingreso'
  origen: string; // 'deduccion_proyecto', 'gasto_general', 'venta_proyecto', 'mantenimiento', 'ingreso_manual'
  proyecto_id?: string | null;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string;
  estado?: string | null;
  usuario_id?: string;
  created_at: string;
}

