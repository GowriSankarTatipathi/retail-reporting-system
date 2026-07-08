import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi, queryKeys } from '@/services/api';
import type {
  InventoryAdjustRequest,
  PageQuery,
  ProductRequest,
  ProductSearchParams,
} from '@/types';

export function useProducts(params: ProductSearchParams & PageQuery, enabled = true) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.searchProducts(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? -1),
    queryFn: () => productsApi.getProduct(id as number),
    enabled: id !== undefined,
  });
}

export function useProductInventory(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.products.inventory(id ?? -1),
    queryFn: () => productsApi.getProductInventory(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ProductRequest) => productsApi.createProduct(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: ProductRequest }) =>
      productsApi.updateProduct(id, request),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
    },
  });
}

export function useDeactivateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsApi.deactivateProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: InventoryAdjustRequest }) =>
      productsApi.adjustProductInventory(id, request),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.inventory(variables.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
