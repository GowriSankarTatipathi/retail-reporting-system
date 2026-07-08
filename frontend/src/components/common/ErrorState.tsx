import { Alert, AlertTitle, Button } from '@mui/material';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** Inline error treatment for a single panel/section (as opposed to ErrorBoundary's whole-page 500). */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      <AlertTitle>Couldn&apos;t load this data</AlertTitle>
      {message}
    </Alert>
  );
}
