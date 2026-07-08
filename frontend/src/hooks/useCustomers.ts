import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi, queryKeys } from '@/services/api';
import type { CustomerRequest, CustomerSearchParams, PageQuery } from '@/types';

export function useCustomers(params: CustomerSearchParams & PageQuery, enabled = true) {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => customersApi.searchCustomers(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCustomer(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id ?? -1),
    queryFn: () => customersApi.getCustomer(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CustomerRequest) => customersApi.createCustomer(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: CustomerRequest }) =>
      customersApi.updateCustomer(id, request),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(variables.id) });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customersApi.deleteCustomer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}
