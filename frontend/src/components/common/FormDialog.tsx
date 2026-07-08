import { useState, type ReactNode } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  /** Pass react-hook-form's formState.isDirty to warn before discarding edits. */
  isDirty?: boolean;
  submitLabel?: string;
  serverError?: string | null;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md';
}

/**
 * Shared create/edit modal shell used by every entity form (category, product,
 * customer, ...). When isDirty is true, closing via Cancel/backdrop/Escape
 * prompts a "discard changes?" confirmation instead of closing immediately.
 */
export function FormDialog({
  open,
  title,
  onClose,
  onSubmit,
  isSubmitting,
  isDirty = false,
  submitLabel = 'Save',
  serverError,
  children,
  maxWidth = 'sm',
}: FormDialogProps) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const requestClose = () => {
    if (isSubmitting) return;
    if (isDirty) {
      setConfirmDiscard(true);
      return;
    }
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(_event, reason) => {
          if (reason === 'backdropClick' && isSubmitting) return;
          requestClose();
        }}
        maxWidth={maxWidth}
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          noValidate
        >
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 0.5 }}>
              {serverError && <Alert severity="error">{serverError}</Alert>}
              {children}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={requestClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              {submitLabel}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard unsaved changes?"
        description="You have unsaved changes in this form. Closing now will discard them."
        confirmLabel="Discard"
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </>
  );
}
