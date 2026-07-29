"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { 
  ProyectoFormValues, 
  DeduccionItem,
  proyectoSchema
} from "@/components/(Kore)/proyectos/lib/zod";
import { z } from "zod";

function toDateMiddayGTM(value: string | undefined | null): string | null {
  if (!value || value.trim() === "") return null;
  const isYYYYMMDD = /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
  return isYYYYMMDD ? `${value.trim()}T12:00:00-06:00` : value;
}

function buildDeducciones(deducciones: DeduccionItem[], proyectoId: string) {
  return deducciones.map((d) => ({
    proyecto_id: proyectoId,
    tipo: d.tipo,
    porcentaje: Number(d.porcentaje) || 0,
    descripcion: d.descripcion || null,
    usuario_id: d.usuario_id || null,
  }));
}

async function findOrCreateCliente(
  supabase: Awaited<ReturnType<typeof createClient>>,
  data: Partial<ProyectoFormValues>
): Promise<string | null> {
  if (!data.cliente_nombre?.trim()) return null;

  const { data: existing } = await supabase
    .from("pro_clientes")
    .select("id")
    .ilike("nombre", data.cliente_nombre.trim())
    .maybeSingle();

  if (existing?.id) {
    const patch: Record<string, string> = {};
    if (data.cliente_telefono) patch.telefono = data.cliente_telefono.trim();
    if (data.cliente_correo)   patch.correo   = data.cliente_correo.trim();
    if (data.cliente_nit)      patch.nit      = data.cliente_nit.trim();
    if (Object.keys(patch).length > 0) {
      await supabase.from("pro_clientes").update(patch).eq("id", existing.id);
    }
    return existing.id;
  }

  const { data: newCliente, error } = await supabase
    .from("pro_clientes")
    .insert([{
      nombre:   data.cliente_nombre.trim(),
      nit:      data.cliente_nit?.trim()      || null,
      telefono: data.cliente_telefono?.trim() || null,
      correo:   data.cliente_correo?.trim()   || null,
    }])
    .select("id")
    .single();

  if (error) {
    return null;
  }
  return newCliente?.id ?? null;
}


export async function getProyectos() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const [{ data, error }, { data: profiles }] = await Promise.all([
    supabase
      .from("proyectos")
      .select(`*, pro_clientes(*), pro_deducciones(*)`)
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, nombre"),
  ]);

  if (error) {
    return [];
  }

  const profilesMap = new Map(
    (profiles || []).map((p: any) => [p.id, p.nombre || "Usuario"])
  );

  return (data || []).map((p: any) => {
    const cliente     = p.pro_clientes || {};
    const rawDeds: any[] = p.pro_deducciones || [];

    const deducciones = rawDeds.map((d: any) => ({
      tipo:          d.tipo,
      porcentaje:    Number(d.porcentaje) || 0,
      descripcion:   d.descripcion || "",
      usuario_id:    d.usuario_id  || "",
      usuario_nombre: d.usuario_id ? (profilesMap.get(d.usuario_id) || "") : "",
    }));

    const comisionDeds = rawDeds.filter((d: any) =>
      d.tipo === "Comisión" || d.tipo === "vendedor" || d.tipo === "Vendedor"
    );
    const ivaDeds = rawDeds.filter((d: any) =>
      d.tipo === "IVA" || d.tipo === "iva"
    );
    const docDeds = rawDeds.filter((d: any) =>
      d.tipo === "Documentación" || d.tipo === "doc"
    );
    const mantDeds = rawDeds.filter((d: any) =>
      d.tipo === "Mantenimiento" || d.tipo === "mantenimiento"
    );
    const desarrolloDeds = rawDeds.filter((d: any) =>
      d.tipo === "Desarrollo" || d.tipo === "desarrollo" || d.tipo === "Desarrollador"
    );

    const sumPct = (arr: any[]) =>
      arr.reduce((acc, d) => acc + (Number(d.porcentaje) || 0), 0);

    return {
      id:           p.id,
      nombre:       p.nombre,
      valor:        Number(p.valor) || 0,
      precio:       Number(p.valor) || 0,
      fecha_entrega: p.fecha_entrega,
      estado:       p.estado,
      activo:       p.activo,
      created_at:   p.created_at,
      created_by:   p.created_by,
      cliente_id:       p.cliente_id,
      cliente_nombre:   cliente.nombre   || "",
      cliente_nit:      cliente.nit      || "",
      cliente_telefono: cliente.telefono || "",
      cliente_correo:   cliente.correo   || "",
      vendedor_id:     (comisionDeds.find((d: any) => d.usuario_id) || comisionDeds[0])?.usuario_id || "",
      vendedor_nombre: (() => {
        const assignedItems = comisionDeds.filter((d: any) => d.usuario_id);
        if (assignedItems.length > 0) {
          const names = assignedItems.map((d: any) => profilesMap.get(d.usuario_id) || d.descripcion || "").filter(Boolean);
          const uniqueNames = Array.from(new Set(names));
          if (uniqueNames.length > 0) return uniqueNames.join(", ");
        }
        const item = comisionDeds[0];
        if (!item) return "";
        return item.descripcion || "";
      })(),
      desarrollador_id:     (desarrolloDeds.find((d: any) => d.usuario_id) || desarrolloDeds[0])?.usuario_id || "",
      desarrollador_nombre: (() => {
        const assignedItems = desarrolloDeds.filter((d: any) => d.usuario_id);
        if (assignedItems.length > 0) {
          const names = assignedItems.map((d: any) => profilesMap.get(d.usuario_id) || d.descripcion || "").filter(Boolean);
          const uniqueNames = Array.from(new Set(names));
          if (uniqueNames.length > 0) return uniqueNames.join(", ");
        }
        const item = desarrolloDeds[0];
        if (!item) return "";
        return item.descripcion || "";
      })(),
      mantenimiento: sumPct(mantDeds),
      deducciones: deducciones.filter(d => d.tipo !== "Mantenimiento" && d.tipo !== "mantenimiento"),
      aplica_vendedor:    comisionDeds.length > 0,
      porcentaje_vendedor: sumPct(comisionDeds),
      aplica_iva:         ivaDeds.length > 0,
      porcentaje_iva:     sumPct(ivaDeds),
      aplica_doc:         docDeds.length > 0,
      porcentaje_doc:     sumPct(docDeds),
      aplica_mantenimiento: mantDeds.length > 0 || (p.otros_campos?.mantenimiento_activo === true),
      monto_mantenimiento:  sumPct(mantDeds),
      aplica_desarrollo:    desarrolloDeds.length > 0,
      porcentaje_desarrollo: sumPct(desarrolloDeds),
      mantenimiento_categoria: mantDeds[0]?.descripcion ?? null,
      mantenimiento_fecha: null,
      resto_desarrollo:    null,
      otros_campos:        p.otros_campos,
      mantenimiento_activo:       p.otros_campos?.mantenimiento_activo ?? false,
      mantenimiento_fecha_cobro:  p.otros_campos?.mantenimiento_fecha_cobro ?? null,
      monto_mensual_fijo:         p.otros_campos?.monto_mensual_fijo ?? null,
    };
  });
}

export async function getProyectoById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !id) return null;

  const [{ data: p, error }, { data: profiles }] = await Promise.all([
    supabase
      .from("proyectos")
      .select(`*, pro_clientes(*), pro_deducciones(*)`)
      .eq("id", id)
      .maybeSingle(),
    supabase.from("profiles").select("id, nombre"),
  ]);

  if (error || !p) {
    return null;
  }

  const profilesMap = new Map(
    (profiles || []).map((prof: any) => [prof.id, prof.nombre || "Usuario"])
  );

  const cliente = p.pro_clientes || {};
  const rawDeds: any[] = p.pro_deducciones || [];

  const deducciones = rawDeds.map((d: any) => ({
    tipo:          d.tipo,
    porcentaje:    Number(d.porcentaje) || 0,
    descripcion:   d.descripcion || "",
    usuario_id:    d.usuario_id  || "",
    usuario_nombre: d.usuario_id ? (profilesMap.get(d.usuario_id) || "") : "",
  }));

  const comisionDeds = rawDeds.filter((d: any) =>
    d.tipo === "Comisión" || d.tipo === "vendedor" || d.tipo === "Vendedor"
  );
  const ivaDeds = rawDeds.filter((d: any) =>
    d.tipo === "IVA" || d.tipo === "iva"
  );
  const docDeds = rawDeds.filter((d: any) =>
    d.tipo === "Documentación" || d.tipo === "doc"
  );
  const mantDeds = rawDeds.filter((d: any) =>
    d.tipo === "Mantenimiento" || d.tipo === "mantenimiento"
  );
  const desarrolloDeds = rawDeds.filter((d: any) =>
    d.tipo === "Desarrollo" || d.tipo === "desarrollo" || d.tipo === "Desarrollador"
  );

  const sumPct = (arr: any[]) =>
    arr.reduce((acc, d) => acc + (Number(d.porcentaje) || 0), 0);

  return {
    id:           p.id,
    nombre:       p.nombre,
    valor:        Number(p.valor) || 0,
    precio:       Number(p.valor) || 0,
    fecha_entrega: p.fecha_entrega,
    estado:       p.estado,
    activo:       p.activo,
    created_at:   p.created_at,
    created_by:   p.created_by,
    cliente_id:       p.cliente_id,
    cliente_nombre:   cliente.nombre   || "",
    cliente_nit:      cliente.nit      || "",
    cliente_telefono: cliente.telefono || "",
    cliente_correo:   cliente.correo   || "",
    vendedor_id:     (comisionDeds.find((d: any) => d.usuario_id) || comisionDeds[0])?.usuario_id || "",
    vendedor_nombre: (() => {
      const assignedItems = comisionDeds.filter((d: any) => d.usuario_id);
      if (assignedItems.length > 0) {
        const names = assignedItems.map((d: any) => profilesMap.get(d.usuario_id) || d.descripcion || "").filter(Boolean);
        const uniqueNames = Array.from(new Set(names));
        if (uniqueNames.length > 0) return uniqueNames.join(", ");
      }
      const item = comisionDeds[0];
      if (!item) return "";
      return item.descripcion || "";
    })(),
    desarrollador_id:     (desarrolloDeds.find((d: any) => d.usuario_id) || desarrolloDeds[0])?.usuario_id || "",
    desarrollador_nombre: (() => {
      const assignedItems = desarrolloDeds.filter((d: any) => d.usuario_id);
      if (assignedItems.length > 0) {
        const names = assignedItems.map((d: any) => profilesMap.get(d.usuario_id) || d.descripcion || "").filter(Boolean);
        const uniqueNames = Array.from(new Set(names));
        if (uniqueNames.length > 0) return uniqueNames.join(", ");
      }
      const item = desarrolloDeds[0];
      if (!item) return "";
      return item.descripcion || "";
    })(),
    mantenimiento: sumPct(mantDeds),
    deducciones: deducciones.filter((d: any) => d.tipo !== "Mantenimiento" && d.tipo !== "mantenimiento"),
    aplica_vendedor:    comisionDeds.length > 0,
    porcentaje_vendedor: sumPct(comisionDeds),
    aplica_iva:         ivaDeds.length > 0,
    porcentaje_iva:     sumPct(ivaDeds),
    aplica_doc:         docDeds.length > 0,
    porcentaje_doc:     sumPct(docDeds),
    aplica_mantenimiento: mantDeds.length > 0 || (p.otros_campos?.mantenimiento_activo === true),
    monto_mantenimiento:  sumPct(mantDeds),
    aplica_desarrollo:    desarrolloDeds.length > 0,
    porcentaje_desarrollo: sumPct(desarrolloDeds),
    mantenimiento_categoria: mantDeds[0]?.descripcion ?? null,
    mantenimiento_fecha: null,
    resto_desarrollo:    null,
    otros_campos:        p.otros_campos,
    mantenimiento_activo:       p.otros_campos?.mantenimiento_activo ?? false,
    mantenimiento_fecha_cobro:  p.otros_campos?.mantenimiento_fecha_cobro ?? null,
    monto_mensual_fijo:         p.otros_campos?.monto_mensual_fijo ?? null,
    pro_clientes: p.pro_clientes
  };
}

export async function createProyecto(rawData: ProyectoFormValues) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "No autorizado. Sesión inválida." };
    }

    const parseResult = proyectoSchema.safeParse(rawData);
    if (!parseResult.success) {
      return { error: "Datos de formulario inválidos." };
    }
    
    const data = parseResult.data;
    const clienteId = await findOrCreateCliente(supabase, data);

    const { data: proyecto, error: proyectoError } = await supabase
      .from("proyectos")
      .insert([{
        nombre:        data.nombre,
        valor:         Number(data.precio) || 0,
        fecha_entrega: toDateMiddayGTM(data.fecha_entrega),
        estado:        data.estado || "En Progreso",
        cliente_id:    clienteId,
        created_by:    user.id,
        activo:        true,
        otros_campos:  { 
          mantenimiento_activo: (data.monto_mensual_fijo && data.monto_mensual_fijo > 0) ? true : false,
          monto_mensual_fijo: data.monto_mensual_fijo || 0,
          mantenimiento_fecha_cobro: toDateMiddayGTM(data.mantenimiento_fecha_cobro)
        },
      }])
      .select("id")
      .single();

    if (proyectoError || !proyecto) {
      return { error: "Error interno al crear el proyecto." };
    }

    const deducciones = buildDeducciones(data.deducciones || [], proyecto.id);
    
    if (deducciones.length > 0) {
      await supabase.from("pro_deducciones").insert(deducciones);
    }

    revalidatePath("/kore/proyectos");
    return { success: true, proyecto_id: proyecto.id };
  } catch (err) {
    return { error: "Ocurrió un error inesperado al procesar la solicitud." };
  }
}

export async function updateProyecto(id: string, rawData: Partial<ProyectoFormValues>) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "No autorizado. Sesión inválida." };
    }
    
    const parseResult = proyectoSchema.partial().safeParse(rawData);
    if (!parseResult.success) {
      return { error: "Datos de formulario inválidos." };
    }
    const data = parseResult.data;

    let clienteId: string | null | undefined = undefined;
    if (data.cliente_nombre !== undefined) {
      clienteId = await findOrCreateCliente(supabase, data);
    }

    const patch: any = {};
    if (data.nombre !== undefined) patch.nombre = data.nombre;
    if (data.precio !== undefined) patch.valor = Number(data.precio);
    if (data.fecha_entrega !== undefined) patch.fecha_entrega = toDateMiddayGTM(data.fecha_entrega);
    if (data.estado !== undefined) patch.estado = data.estado;
    if (clienteId !== undefined) patch.cliente_id = clienteId;

    if (data.monto_mensual_fijo !== undefined || data.mantenimiento_fecha_cobro !== undefined) {
      const { data: currentProyecto } = await supabase.from("proyectos").select("otros_campos").eq("id", id).single();
      const otrosCampos = currentProyecto?.otros_campos || {};
      patch.otros_campos = { 
        ...otrosCampos, 
        mantenimiento_activo: (data.monto_mensual_fijo && data.monto_mensual_fijo > 0) ? true : false,
        monto_mensual_fijo: data.monto_mensual_fijo !== undefined ? (data.monto_mensual_fijo || 0) : (otrosCampos.monto_mensual_fijo || 0),
        mantenimiento_fecha_cobro: data.mantenimiento_fecha_cobro !== undefined ? toDateMiddayGTM(data.mantenimiento_fecha_cobro) : (otrosCampos.mantenimiento_fecha_cobro || null)
      };
    }

    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from("proyectos").update(patch).eq("id", id);
      if (error) {
        return { error: "Error interno al actualizar el proyecto." };
      }
    }

    if (data.deducciones !== undefined) {
      const { error: deleteError } = await supabase
        .from("pro_deducciones")
        .delete()
        .eq("proyecto_id", id);

      if (deleteError) {
        return { error: "Error al actualizar deducciones." };
      }

      const deducciones = buildDeducciones(data.deducciones || [], id);

      if (deducciones.length > 0) {
        await supabase.from("pro_deducciones").insert(deducciones);
      }
    }

    revalidatePath("/kore/proyectos");
    return { success: true };
  } catch (err) {
    return { error: "Ocurrió un error inesperado al procesar la solicitud." };
  }
}

export async function deleteProyecto(id: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "No autorizado. Sesión inválida." };
    }

    const { error } = await supabase.from("proyectos").delete().eq("id", id);

    if (error) {
      return { error: "Error interno al eliminar." };
    }

    revalidatePath("/kore/proyectos");
    return { success: true };
  } catch (err) {
    return { error: "Ocurrió un error inesperado al procesar la solicitud." };
  }
}

export async function updateProyectoOtrosCampos(id: string, otrosCampos: any) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado." };

    const { error } = await supabase
      .from("proyectos")
      .update({ otros_campos: otrosCampos })
      .eq("id", id);

    if (error) {
      return { error: "Error interno." };
    }

    revalidatePath("/kore/proyectos");
    return { success: true };
  } catch (err) {
    return { error: "Ocurrió un error inesperado." };
  }
}

export async function updateMantenimientoProyecto(
  id: string,
  activo: boolean,
  fechaCobro: string | null
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado." };

    const { data: currentProyecto } = await supabase.from("proyectos").select("otros_campos").eq("id", id).single();
    const otrosCampos = currentProyecto?.otros_campos || {};
    const updatedOtrosCampos = {
      ...otrosCampos,
      mantenimiento_activo: activo,
      mantenimiento_fecha_cobro: toDateMiddayGTM(fechaCobro) || null,
    };

    const { error } = await supabase
      .from("proyectos")
      .update({ otros_campos: updatedOtrosCampos })
      .eq("id", id);

    if (error) {
      return { error: "Error interno." };
    }

    revalidatePath("/kore/proyectos");
    revalidatePath("/kore/proyectos/mantenimiento");
    return { success: true };
  } catch (err) {
    return { error: "Ocurrió un error inesperado." };
  }
}

export async function getMantenimientoHistorial(proyectoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("pro_mantenimientos")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("fecha_pago", { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
}

const registroPagoSchema = z.object({
  proyectoId: z.string().uuid(),
  montoCobrado: z.number().min(0),
  fechaPago: z.string().min(1),
  periodoPagado: z.string().min(1),
  descripcion: z.string(),
  proximaFechaCobro: z.string().nullable()
});

export async function registrarPagoMantenimiento(
  proyectoId: string,
  montoCobrado: number,
  fechaPago: string,
  periodoPagado: string,
  descripcion: string,
  proximaFechaCobro: string | null
) {
  try {
    const parseResult = registroPagoSchema.safeParse({ proyectoId, montoCobrado, fechaPago, periodoPagado, descripcion, proximaFechaCobro });
    if (!parseResult.success) {
      return { error: "Datos de formulario inválidos." };
    }

    const supabase = await createClient();
    let username = "Usuario";
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { error: "No autorizado." };
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre")
      .eq("id", user.id)
      .maybeSingle();
      
    if (profile?.nombre) {
      username = profile.nombre;
    }

    const { error: insertError } = await supabase
      .from("pro_mantenimientos")
      .insert([{
        proyecto_id: proyectoId,
        monto_cobrado: montoCobrado,
        fecha_pago: toDateMiddayGTM(fechaPago),
        periodo_pagado: periodoPagado,
        descripcion: `${descripcion} | Confirmado por: ${username}`
      }]);

    if (insertError) {
      return { error: "Error al insertar el pago." };
    }

    const { data: currentProyecto } = await supabase.from("proyectos").select("otros_campos").eq("id", proyectoId).single();
    const otrosCampos = currentProyecto?.otros_campos || {};
    const updatedOtrosCampos = { ...otrosCampos };
    let needsUpdate = false;

    if (proximaFechaCobro) {
      updatedOtrosCampos.mantenimiento_fecha_cobro = toDateMiddayGTM(proximaFechaCobro);
      needsUpdate = true;
    }

    if (!otrosCampos.monto_mensual_fijo && montoCobrado > 0) {
      const { data: mantDeds } = await supabase
        .from("pro_deducciones")
        .select("id")
        .eq("proyecto_id", proyectoId)
        .in("tipo", ["Mantenimiento", "mantenimiento"]);
        
      if (!mantDeds || mantDeds.length === 0) {
        updatedOtrosCampos.monto_mensual_fijo = montoCobrado;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await supabase
        .from("proyectos")
        .update({ otros_campos: updatedOtrosCampos })
        .eq("id", proyectoId);
    }

    revalidatePath("/kore/proyectos");
    revalidatePath("/kore/proyectos/mantenimiento");
    return { success: true };
  } catch (err) {
    return { error: "Error inesperado al registrar pago." };
  }
}

export async function eliminarPagoMantenimiento(
  pagoId: string,
  proyectoId: string,
  nuevaProximaFecha: string | null
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado." };

    // Fetch original payment to log the annulment
    const { data: pagoOriginal } = await supabase
      .from("pro_mantenimientos")
      .select("*")
      .eq("id", pagoId)
      .single();

    const { error: deleteError } = await supabase
      .from("pro_mantenimientos")
      .delete()
      .eq("id", pagoId);

    if (deleteError) {
      return { error: "Error interno al eliminar el pago." };
    }

    // Insert annulment record into pro_gastos with 0 amount
    if (pagoOriginal) {
      let username = "Usuario";
      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.nombre) {
        username = profile.nombre;
      }

      await supabase.from("pro_gastos").insert([{
        proyecto_id: proyectoId,
        tipo: "Anulado",
        monto: 0,
        estado: "anulado",
        fecha: new Date().toISOString(),
        descripcion: `ANULADO: ${pagoOriginal.descripcion} | Anulado por: ${username}`,
        usuario_id: user.id
      }]);
    }

    const { data: currentProyecto } = await supabase.from("proyectos").select("otros_campos").eq("id", proyectoId).single();
    const otrosCampos = currentProyecto?.otros_campos || {};
    const updatedOtrosCampos = {
      ...otrosCampos,
      mantenimiento_fecha_cobro: nuevaProximaFecha ? toDateMiddayGTM(nuevaProximaFecha) : null,
    };

    await supabase
      .from("proyectos")
      .update({ otros_campos: updatedOtrosCampos })
      .eq("id", proyectoId);

    revalidatePath("/kore/proyectos");
    revalidatePath("/kore/proyectos/mantenimiento");
    return { success: true };
  } catch (err) {
    return { error: "Ocurrió un error inesperado al eliminar pago." };
  }
}
