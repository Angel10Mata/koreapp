import { z } from "zod";

export const TIPOS_DEDUCCION = [
  "Kore",
  "Documentación",
  "Vendedor",
  "Desarrollador",
  "IVA",
] as const;

export type TipoDeduccion = (typeof TIPOS_DEDUCCION)[number];

export const deduccionItemSchema = z.object({
  tipo: z.string().min(1),
  porcentaje: z.coerce.number().min(0).default(0),
  descripcion: z.string().optional().or(z.literal("")),
  usuario_id: z.string().optional().or(z.literal("")),
});

export type DeduccionItem = z.infer<typeof deduccionItemSchema>;

export const proyectoSchema = z.object({
  nombre: z.string().min(1, "El nombre del proyecto es requerido"),
  // Cliente
  cliente_nombre: z.string().optional(),
  cliente_nit: z.string().optional(),
  cliente_telefono: z.string().optional(),
  cliente_correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  // Proyecto
  fecha_entrega: z.string().optional().or(z.literal("")),
  precio: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && Number.isNaN(val)) ? 0 : val),
    z.coerce.number().min(0, "El precio no puede ser negativo")
  ),
  monto_mensual_fijo: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && Number.isNaN(val)) ? 0 : val),
    z.coerce.number().min(0, "El monto de mantenimiento no puede ser negativo").optional()
  ),
  mantenimiento_fecha_cobro: z.string().optional().or(z.literal("")),
  estado: z.string().default("En Progreso"),
  // Vendedor (usuario registrado que lleva la comisión principal) - Opcional, pero lo mantenemos para backward compat si se necesita o lo usamos de primer vendedor
  vendedor_id: z.string().optional().or(z.literal("")).default(""),
  // Deducciones: lista dinámica
  deducciones: z.array(deduccionItemSchema).default([]),
});

export type ProyectoFormValues = z.infer<typeof proyectoSchema>;

export interface OtrosCamposProyecto {
  mantenimiento_activo?: boolean;
  mantenimiento_fecha_cobro?: string | null;
  monto_mensual_fijo?: number | null;
  usuario_acceso?: string;
  pass_acceso?: string;
  url_acceso?: string;
  qr_codigo?: string | null;
  qr_generado_at?: string | null;
  [key: string]: unknown;
}

export interface DeduccionItemConUsuario extends DeduccionItem {
  usuario_nombre?: string;
}

export interface Cliente {
  id?: string;
  nombre?: string;
  nit?: string | null;
  telefono?: string | null;
  correo?: string | null;
}

export interface Profile {
  id: string;
  nombre?: string | null;
  [key: string]: unknown;
}

export interface MantenimientoRecord {
  id: string;
  proyecto_id: string;
  monto_cobrado: number;
  fecha_pago: string;
  periodo_pagado: string;
  descripcion: string;
  created_at?: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  valor: number;
  precio: number;
  fecha_entrega?: string | null;
  estado: string;
  activo: boolean;
  created_at: string;
  created_by?: string;
  cliente_id?: string | null;
  cliente_nombre: string;
  cliente_nit: string;
  cliente_telefono: string;
  cliente_correo: string;
  vendedor_id: string;
  vendedor_nombre: string;
  desarrollador_id: string;
  desarrollador_nombre: string;
  mantenimiento: number;
  deducciones: DeduccionItemConUsuario[];
  aplica_vendedor: boolean;
  porcentaje_vendedor: number;
  aplica_iva: boolean;
  porcentaje_iva: number;
  aplica_doc: boolean;
  porcentaje_doc: number;
  aplica_mantenimiento: boolean;
  monto_mantenimiento: number;
  aplica_desarrollo: boolean;
  porcentaje_desarrollo: number;
  mantenimiento_categoria: string | null;
  mantenimiento_fecha: string | null;
  resto_desarrollo: number | null;
  otros_campos?: OtrosCamposProyecto | null;
  mantenimiento_activo: boolean;
  mantenimiento_fecha_cobro: string | null;
  monto_mensual_fijo: number | null;
  pro_clientes?: Cliente | null;
}

