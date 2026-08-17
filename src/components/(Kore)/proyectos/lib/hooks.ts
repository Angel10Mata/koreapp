import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getProyectos,
  getProyectoById,
  createProyecto,
  updateProyecto,
  deleteProyecto,
  getMantenimientoHistorial,
  registrarPagoMantenimiento,
  eliminarPagoMantenimiento,
  updateProyectoOtrosCampos
} from "./actions";
import { ProyectoFormValues, OtrosCamposProyecto } from "./zod";

// ── QUERIES ──

export const useProyectos = () => {
  return useQuery({
    queryKey: ["proyectos-list"],
    queryFn: getProyectos,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProyecto = (id: string) => {
  return useQuery({
    queryKey: ["proyecto", id],
    queryFn: () => getProyectoById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMantenimientoHistorial = (proyectoId: string) => {
  return useQuery({
    queryKey: ["mantenimiento-historial", proyectoId],
    queryFn: () => getMantenimientoHistorial(proyectoId),
    enabled: !!proyectoId,
    staleTime: 5 * 60 * 1000,
  });
};

// ── MUTATIONS ──

export const useCreateProyecto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProyectoFormValues) => createProyecto(data),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Proyecto Creado");
        queryClient.invalidateQueries({ queryKey: ["proyectos-list"] });
        queryClient.invalidateQueries({ queryKey: ["pro-clientes-list"] });
      }
    },
    onError: () => toast.error("Error inesperado al crear el proyecto"),
  });
};

export const useUpdateProyecto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProyectoFormValues }) => updateProyecto(id, data),
    onSuccess: (res, { id }) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Proyecto Actualizado");
        queryClient.invalidateQueries({ queryKey: ["proyectos-list"] });
        queryClient.invalidateQueries({ queryKey: ["proyecto", id] });
      }
    },
    onError: () => toast.error("Error inesperado al actualizar el proyecto"),
  });
};

export const useDeleteProyecto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProyecto(id),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Proyecto Eliminado");
        queryClient.invalidateQueries({ queryKey: ["proyectos-list"] });
      }
    },
    onError: () => toast.error("Error inesperado al eliminar el proyecto"),
  });
};

export const useRegistrarPagoMantenimiento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      proyectoId, 
      monto, 
      fechaPago, 
      periodoPagado, 
      descripcion, 
      proximaFecha 
    }: { 
      proyectoId: string, 
      monto: number, 
      fechaPago: string, 
      periodoPagado: string, 
      descripcion: string, 
      proximaFecha: string | null 
    }) => registrarPagoMantenimiento(proyectoId, monto, fechaPago, periodoPagado, descripcion, proximaFecha),
    onSuccess: (res, { proyectoId }) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Pago de mantenimiento registrado");
        queryClient.invalidateQueries({ queryKey: ["mantenimiento-historial", proyectoId] });
        queryClient.invalidateQueries({ queryKey: ["proyectos-list"] });
      }
    },
    onError: () => toast.error("Error inesperado al registrar el pago"),
  });
};

export const useEliminarPagoMantenimiento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      pagoId, 
      proyectoId, 
      newProximaFecha 
    }: { 
      pagoId: string, 
      proyectoId: string, 
      newProximaFecha: string | null 
    }) => eliminarPagoMantenimiento(pagoId, proyectoId, newProximaFecha),
    onSuccess: (res, { proyectoId }) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Pago de mantenimiento eliminado");
        queryClient.invalidateQueries({ queryKey: ["mantenimiento-historial", proyectoId] });
        queryClient.invalidateQueries({ queryKey: ["proyectos-list"] });
      }
    },
    onError: () => toast.error("Error inesperado al eliminar el pago"),
  });
};

export const useUpdateProyectoOtrosCampos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otrosCampos }: { id: string; otrosCampos: OtrosCamposProyecto }) => updateProyectoOtrosCampos(id, otrosCampos),
    onSuccess: (res, { id }) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Campos actualizados");
        queryClient.invalidateQueries({ queryKey: ["proyecto", id] });
        queryClient.invalidateQueries({ queryKey: ["proyectos-list"] });
      }
    },
    onError: () => toast.error("Error inesperado al actualizar campos"),
  });
};
