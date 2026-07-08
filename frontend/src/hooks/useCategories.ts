import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, queryKeys } from '@/services/api';
import type { CategoryRequest } from '@/types';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: categoriesApi.listCategories,
  });
}

export function useCategory(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id ?? -1),
    queryFn: () => categoriesApi.getCategory(id as number),
    enabled: id !== undefined,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CategoryRequest) => categoriesApi.createCategory(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: CategoryRequest }) =>
      categoriesApi.updateCategory(id, request),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(variables.id) });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}
