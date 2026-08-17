import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { obtenerFlujoCaja, obtenerGastos, crearGasto, crearIngreso, actualizarGasto, anularGasto, anularIngreso } from "@/components/(Kore)/finanzas/lib/actions";
import { GastoFormValues, IngresoFormValues } from "@/components/(Kore)/finanzas/lib/zod";

// Claves de consulta
export const finanzasKeys = {
  flujoCaja: ["flujo_caja"] as const,
  gastos: ["gastos"] as const,
};

// Hook para obtener el flujo de caja unificado
export function useFlujoCaja() {
  return useQuery({
    queryKey: finanzasKeys.flujoCaja,
    queryFn: async () => {
      const { data, error } = await obtenerFlujoCaja();
      if (error) throw new Error(error);
      return data || [];
    },
  });
}

// Hook para obtener solo los gastos de pro_gastos
export function useGastos() {
  return useQuery({
    queryKey: finanzasKeys.gastos,
    queryFn: async () => {
      const { data, error } = await obtenerGastos();
      if (error) throw new Error(error);
      return data || [];
    },
  });
}

// Hook para crear un gasto
export function useCrearGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: GastoFormValues) => crearGasto(datos),
    onSuccess: (res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      // Invalidar ambas consultas ya que un gasto afecta el flujo de caja
      queryClient.invalidateQueries({ queryKey: finanzasKeys.gastos });
      queryClient.invalidateQueries({ queryKey: finanzasKeys.flujoCaja });
    },
  });
}

// Hook para crear un ingreso manual
export function useCrearIngreso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datos: IngresoFormValues) => crearIngreso(datos),
    onSuccess: (res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      queryClient.invalidateQueries({ queryKey: finanzasKeys.flujoCaja });
    },
  });
}

// Hook para actualizar un gasto
export function useActualizarGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: GastoFormValues }) => actualizarGasto(id, datos),
    onSuccess: (res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      queryClient.invalidateQueries({ queryKey: finanzasKeys.gastos });
      queryClient.invalidateQueries({ queryKey: finanzasKeys.flujoCaja });
    },
  });
}

// Hook para anular un gasto (anulación lógica)
export function useAnularGasto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => anularGasto(id),
    onSuccess: (res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      queryClient.invalidateQueries({ queryKey: finanzasKeys.gastos });
      queryClient.invalidateQueries({ queryKey: finanzasKeys.flujoCaja });
    },
  });
}

// Hook para anular un ingreso manual (anulación lógica)
export function useAnularIngreso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => anularIngreso(id),
    onSuccess: (res) => {
      if (res.error) {
        throw new Error(res.error);
      }
      queryClient.invalidateQueries({ queryKey: finanzasKeys.flujoCaja });
    },
  });
}
