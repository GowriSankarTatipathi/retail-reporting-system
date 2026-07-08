import { useCallback, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Chip, MenuItem, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/hooks/useAuth';
import { useSetUserEnabled, useUpdateUserRole, useUsers } from '@/hooks/useUsers';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toApiError } from '@/services/api';
import { formatDate } from '@/utils/format';
import { ROLES } from '@/types';
import type { Role, User } from '@/types';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const updateRole = useUpdateUserRole();
  const setEnabled = useSetUserEnabled();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [disableTarget, setDisableTarget] = useState<User | null>(null);

  const { data, isLoading, error, refetch } = useUsers({ page: pageIndex, size: pageSize });

  const handleRoleChange = useCallback(
    async (targetUser: User, role: Role) => {
      try {
        await updateRole.mutateAsync({ id: targetUser.id, role });
        enqueueSnackbar(`${targetUser.fullName}'s role is now ${role}.`, { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(toApiError(error).message, { variant: 'error' });
      }
    },
    [updateRole, enqueueSnackbar]
  );

  const handleToggleEnabled = useCallback(
    async (targetUser: User) => {
      if (targetUser.enabled) {
        // Disabling is the risky direction (locks the account out) - confirm first.
        setDisableTarget(targetUser);
        return;
      }
      try {
        await setEnabled.mutateAsync({ id: targetUser.id, enabled: true });
        enqueueSnackbar(`${targetUser.fullName}'s account has been enabled.`, {
          variant: 'success',
        });
      } catch (error) {
        enqueueSnackbar(toApiError(error).message, { variant: 'error' });
      }
    },
    [setEnabled, enqueueSnackbar]
  );

  const confirmDisable = async () => {
    if (!disableTarget) return;
    try {
      await setEnabled.mutateAsync({ id: disableTarget.id, enabled: false });
      enqueueSnackbar(`${disableTarget.fullName}'s account has been disabled.`, {
        variant: 'success',
      });
      setDisableTarget(null);
    } catch (error) {
      enqueueSnackbar(toApiError(error).message, { variant: 'error' });
    }
  };

  const columns: ColumnDef<User, unknown>[] = useMemo(
    () => [
      { accessorKey: 'fullName', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      {
        id: 'role',
        header: 'Role',
        enableSorting: false,
        cell: ({ row }) => {
          const targetUser = row.original;
          const isSelf = targetUser.id === currentUser?.id;
          return (
            <Tooltip title={isSelf ? "You can't change your own role" : ''}>
              <TextField
                select
                size="small"
                value={targetUser.role}
                disabled={isSelf || updateRole.isPending}
                onChange={(e) => void handleRoleChange(targetUser, e.target.value as Role)}
                sx={{ minWidth: 140 }}
              >
                {ROLES.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Tooltip>
          );
        },
      },
      {
        id: 'enabled',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => {
          const targetUser = row.original;
          const isSelf = targetUser.id === currentUser?.id;
          return (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Tooltip title={isSelf ? "You can't disable your own account" : ''}>
                <span>
                  <Switch
                    size="small"
                    checked={targetUser.enabled}
                    disabled={isSelf || setEnabled.isPending}
                    onChange={() => void handleToggleEnabled(targetUser)}
                  />
                </span>
              </Tooltip>
              <Chip
                label={targetUser.enabled ? 'Active' : 'Disabled'}
                color={targetUser.enabled ? 'success' : 'default'}
                size="small"
                variant="outlined"
              />
            </Stack>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined',
        cell: (info) => formatDate(info.getValue<string>()),
      },
    ],
    [
      currentUser?.id,
      updateRole.isPending,
      setEnabled.isPending,
      handleRoleChange,
      handleToggleEnabled,
    ]
  );

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h1">
        User administration
      </Typography>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        getRowId={(row) => String(row.id)}
        isLoading={isLoading}
        errorMessage={error ? toApiError(error).message : null}
        onRetry={() => void refetch()}
        emptyTitle="No users found"
        pagination={{
          pageIndex,
          pageSize,
          totalRows: data?.totalElements ?? 0,
          onPageChange: setPageIndex,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPageIndex(0);
          },
        }}
      />

      <ConfirmDialog
        open={!!disableTarget}
        title="Disable user account"
        description={`Disable "${disableTarget?.fullName}"? They will immediately lose the ability to log in.`}
        confirmLabel="Disable"
        isSubmitting={setEnabled.isPending}
        onConfirm={confirmDisable}
        onCancel={() => setDisableTarget(null)}
      />
    </Stack>
  );
}
