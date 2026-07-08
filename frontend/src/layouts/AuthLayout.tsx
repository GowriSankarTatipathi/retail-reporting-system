import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

/** Centered-card shell for every unauthenticated page (login, register, forgot password, ...). */
export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Stack spacing={3} sx={{ alignItems: 'center' }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Retail Reporting System
          </Typography>
          <Paper elevation={2} sx={{ p: 4, width: '100%' }}>
            <Outlet />
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
