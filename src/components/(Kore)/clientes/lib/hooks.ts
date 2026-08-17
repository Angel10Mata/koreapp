import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClientes, createCliente, updateCliente, deleteCliente } from "./actions";
import { ClienteFormValues } from "./zod";
import { toast } from "react-toastify";

export const useClientes = () => {
  return useQuery({
    queryKey: ["pro-clientes-list"],
    queryFn: getClientes,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClienteFormValues) => createCliente(data),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Cliente Creado");
        queryClient.invalidateQueries({ queryKey: ["pro-clientes-list"] });
      }
    },
    onError: () => toast.error("Error inesperado al crear el cliente"),
  });
};

export const useUpdateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClienteFormValues }) => updateCliente(id, data),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Cliente Actualizado");
        queryClient.invalidateQueries({ queryKey: ["pro-clientes-list"] });
      }
    },
    onError: () => toast.error("Error inesperado al actualizar el cliente"),
  });
};

export const useDeleteCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCliente(id),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Cliente Eliminado");
        queryClient.invalidateQueries({ queryKey: ["pro-clientes-list"] });
      }
    },
    onError: () => toast.error("Error inesperado al eliminar el cliente"),
  });
};
