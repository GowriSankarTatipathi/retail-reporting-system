import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types';

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (request: UpdateProfileRequest) => authApi.updateProfile(request),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (request: ChangePasswordRequest) => authApi.changePassword(request),
  });
}
