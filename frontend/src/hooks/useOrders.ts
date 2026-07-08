import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi, queryKeys } from '@/services/api';
import type { OrderRequest, OrderSearchParams, OrderStatus, PageQuery } from '@/types';

export function useOrders(params: OrderSearchParams & PageQuery) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => ordersApi.searchOrders(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? -1),
    queryFn: () => ordersApi.getOrder(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: OrderRequest) => ordersApi.createOrder(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      // Placing an order changes stock levels, so product/inventory views can go stale too.
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      ordersApi.updateOrderStatus(id, status),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
      // A cancellation releases stock back to inventory.
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
