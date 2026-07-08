import { Skeleton, Stack, Typography } from '@mui/material';

/**
 * Temporary scaffold for a route that compiles and is reachable today, but
 * whose real implementation lands in a later, dedicated commit (see the
 * project's task list / commit history). Never the final state of a page -
 * every one of these is replaced before the project is considered done.
 */
export function ScaffoldPage({ title }: { title: string }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h5" component="h1">
        {title}
      </Typography>
      <Skeleton variant="rounded" height={48} />
      <Skeleton variant="rounded" height={320} />
    </Stack>
  );
}
