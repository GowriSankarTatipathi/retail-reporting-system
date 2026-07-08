import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, usersApi } from '@/services/api';
import type { PageQuery, Role } from '@/types';

export function useUsers(params: PageQuery) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.listUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => usersApi.updateUserRole(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useSetUserEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      usersApi.setUserEnabled(id, enabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
