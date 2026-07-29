"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { clienteSchema, ClienteFormValues } from "./zod";

interface DBProyecto {
  id: string;
  nombre: string;
  estado: string;
  valor: number;
  fecha_entrega?: string | null;
}

interface DBCliente {
  id: string;
  nombre: string;
  nit?: string | null;
  telefono?: string | null;
  correo?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  created_at: string;
  proyectos?: DBProyecto[];
}

interface ClienteProyecto {
  id: string;
  nombre: string;
  estado: string;
  precio: number;
  fecha?: string | null;
}

interface Cliente {
  id: string;
  nombre: string;
  nit: string;
  telefono: string;
  correo: string;
  departamento: string;
  municipio: string;
  created_at: string;
  proyectosCount: number;
  totalPagado: number;
  proyectosList: ClienteProyecto[];
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — Fetches all clients from pro_clientes with their associated projects
// ─────────────────────────────────────────────────────────────────────────────
export async function getClientes(): Promise<Cliente[]> {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("pro_clientes")
      .select(`
        *,
        proyectos(id, nombre, estado, valor, fecha_entrega)
      `)
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error fetching clientes:", error);
      return [];
    }

    return ((data as unknown as DBCliente[]) || []).map((c: DBCliente) => {
      const proyectosList = c.proyectos || [];
      const totalPagado = proyectosList.reduce(
        (acc: number, p: DBProyecto) => acc + (Number(p.valor) || 0),
        0
      );
      return {
        id: c.id,
        nombre: c.nombre,
        nit: c.nit || "",
        telefono: c.telefono || "",
        correo: c.correo || "",
        departamento: c.departamento || "",
        municipio: c.municipio || "",
        created_at: c.created_at,
        proyectosCount: proyectosList.length,
        totalPagado,
        proyectosList: proyectosList
          .map((p: DBProyecto) => ({
            id: p.id,
            nombre: p.nombre,
            estado: p.estado,
            precio: Number(p.valor) || 0,
            fecha: p.fecha_entrega,
          }))
          .sort((a: ClienteProyecto, b: ClienteProyecto) => b.precio - a.precio),
      };
    }).sort((a: Cliente, b: Cliente) => b.totalPagado - a.totalPagado);
  } catch (err) {
    console.error("Unexpected error in getClientes:", err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE — Register a new client in pro_clientes
// ─────────────────────────────────────────────────────────────────────────────
export async function createCliente(data: ClienteFormValues) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autorizado." };

    // Validación Zod
    const parsed = clienteSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos de cliente inválidos.", details: parsed.error.format() };
    }

    const { data: newCliente, error } = await supabase
      .from("pro_clientes")
      .insert([{
        nombre: parsed.data.nombre.trim(),
        nit: parsed.data.nit?.trim() || null,
        telefono: parsed.data.telefono?.trim() || null,
        correo: parsed.data.correo?.trim() || null,
        departamento: parsed.data.departamento?.trim() || null,
        municipio: parsed.data.municipio?.trim() || null,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating cliente:", error);
      return { error: "Error de base de datos al crear el cliente." };
    }

    revalidatePath("/kore/clientes");
    revalidatePath("/kore/proyectos");
    return { success: true, cliente: newCliente };
  } catch (err) {
    console.error("Unexpected error in createCliente:", err);
    return { error: "Ocurrió un error inesperado al procesar la solicitud." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE — Modify existing client details in pro_clientes
// ─────────────────────────────────────────────────────────────────────────────
export async function updateCliente(id: string, data: ClienteFormValues) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autorizado." };

    if (!id) return { error: "ID de cliente no proporcionado." };

    // Validación Zod
    const parsed = clienteSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Datos de cliente inválidos.", details: parsed.error.format() };
    }

    const { data: updatedCliente, error } = await supabase
      .from("pro_clientes")
      .update({
        nombre: parsed.data.nombre.trim(),
        nit: parsed.data.nit?.trim() || null,
        telefono: parsed.data.telefono?.trim() || null,
        correo: parsed.data.correo?.trim() || null,
        departamento: parsed.data.departamento?.trim() || null,
        municipio: parsed.data.municipio?.trim() || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating cliente:", error);
      return { error: "Error de base de datos al actualizar el cliente." };
    }

    revalidatePath("/kore/clientes");
    revalidatePath("/kore/proyectos");
    return { success: true, cliente: updatedCliente };
  } catch (err) {
    console.error("Unexpected error in updateCliente:", err);
    return { error: "Ocurrió un error inesperado al procesar la solicitud." };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE — Remove a client record from pro_clientes
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteCliente(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autorizado." };

    if (!id) return { error: "ID de cliente no proporcionado." };

    // Verificar explícitamente si tiene proyectos asociados
    const { data: proyectos, error: errorProyectos } = await supabase
      .from("proyectos")
      .select("id")
      .eq("cliente_id", id)
      .limit(1);

    if (errorProyectos) {
      console.error("Error checking proyectos for client:", errorProyectos);
      return { error: "No se pudo verificar la asociación del cliente." };
    }

    if (proyectos && proyectos.length > 0) {
      return { error: "No se puede eliminar un cliente que tenga proyectos asignados." };
    }

    const { error } = await supabase
      .from("pro_clientes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting cliente:", error);
      if (error.code === '23503' || error.message?.includes('foreign key constraint')) {
        return { error: "No se puede eliminar un cliente que tenga proyectos asignados." };
      }
      return { error: "Error de base de datos al eliminar el cliente." };
    }

    revalidatePath("/kore/clientes");
    revalidatePath("/kore/proyectos");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in deleteCliente:", err);
    return { error: "Ocurrió un error inesperado al procesar la solicitud." };
  }
}
