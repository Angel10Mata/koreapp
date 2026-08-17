import { z } from "zod";

export const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre del cliente es requerido"),
  nit: z.string().optional().or(z.literal("")),
  telefono: z.string().optional().or(z.literal("")),
  correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  departamento: z.string().optional().or(z.literal("")),
  municipio: z.string().optional().or(z.literal("")),
});

export type ClienteFormValues = z.infer<typeof clienteSchema>;
