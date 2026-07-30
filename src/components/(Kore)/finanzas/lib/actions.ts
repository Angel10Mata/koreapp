"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { finanzasSchema, GastoFormValues, ingresoSchema, IngresoFormValues, DBGasto, DBFlujoCaja } from "./zod";

export async function obtenerFlujoCaja() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from("pro_flujo_caja")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error al obtener flujo de caja:", error);
      return { data: null, error: error.message };
    }

    return { data: data as DBFlujoCaja[], error: null };
  } catch (error: any) {
    return { data: null, error: error.message || "Error desconocido al obtener flujo de caja" };
  }
}

export async function obtenerGastos() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from("pro_gastos")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error al obtener gastos:", error);
      return { data: null, error: error.message };
    }

    return { data: data as DBGasto[], error: null };
  } catch (error: any) {
    return { data: null, error: error.message || "Error desconocido al obtener gastos" };
  }
}

export async function crearGasto(formData: GastoFormValues) {
  const supabase = await createClient();

  try {
    // 1. Validar datos
    const parsed = finanzasSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: "Datos inválidos", details: parsed.error.format() };
    }

    // 2. Obtener usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Usuario no autenticado" };
    }

    // 3. Insertar en pro_gastos
    const { error: insertError } = await supabase
      .from("pro_gastos")
      .insert({
        tipo: parsed.data.tipo,
        descripcion: parsed.data.descripcion,
        monto: parsed.data.monto,
        usuario_id: user.id,
        // estado y fecha toman valores default si no se envían
      });

    if (insertError) {
      console.error("Error al insertar gasto:", insertError);
      return { error: insertError.message };
    }

    revalidatePath("/kore/finanzas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error interno al crear gasto" };
  }
}

export async function crearIngreso(formData: IngresoFormValues) {
  const supabase = await createClient();

  try {
    const parsed = ingresoSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: "Datos inválidos", details: parsed.error.format() };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Usuario no autenticado" };
    }

    const { error: insertError } = await supabase
      .from("pro_ingresos")
      .insert({
        categoria: parsed.data.categoria,
        descripcion: parsed.data.descripcion,
        monto: parsed.data.monto,
        usuario_id: user.id,
      });

    if (insertError) {
      console.error("Error al insertar ingreso:", insertError);
      return { error: insertError.message };
    }

    revalidatePath("/kore/finanzas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error interno al crear ingreso" };
  }
}

export async function actualizarGasto(id: string, formData: GastoFormValues) {
  const supabase = await createClient();

  try {
    const parsed = finanzasSchema.safeParse(formData);
    if (!parsed.success) {
      return { error: "Datos inválidos", details: parsed.error.format() };
    }

    const { error: updateError } = await supabase
      .from("pro_gastos")
      .update({
        tipo: parsed.data.tipo,
        descripcion: parsed.data.descripcion,
        monto: parsed.data.monto,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error al actualizar gasto:", updateError);
      return { error: updateError.message };
    }

    revalidatePath("/kore/finanzas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error interno al actualizar gasto" };
  }
}

export async function anularGasto(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("pro_gastos")
      .update({ estado: "anulado", monto: 0 })
      .eq("id", id);

    if (error) {
      console.error("Error al anular gasto:", error);
      return { error: error.message };
    }

    revalidatePath("/kore/finanzas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error interno al anular gasto" };
  }
}

export async function anularIngreso(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("pro_ingresos")
      .update({ estado: "anulado", monto: 0 })
      .eq("id", id);

    if (error) {
      console.error("Error al anular ingreso:", error);
      return { error: error.message };
    }

    revalidatePath("/kore/finanzas");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error interno al anular ingreso" };
  }
}

