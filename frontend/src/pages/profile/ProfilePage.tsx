import { useState } from 'react';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { UpdateProfileForm } from '@/components/forms/UpdateProfileForm';
import { ChangePasswordForm } from '@/components/forms/ChangePasswordForm';

export default function ProfilePage() {
  const [tab, setTab] = useState<'profile' | 'security'>('profile');

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h1">
        Profile
      </Typography>

      <Tabs value={tab} onChange={(_, value: 'profile' | 'security') => setTab(value)}>
        <Tab label="Profile" value="profile" />
        <Tab label="Security" value="security" />
      </Tabs>

      <Box role="tabpanel" hidden={tab !== 'profile'}>
        {tab === 'profile' && <UpdateProfileForm />}
      </Box>
      <Box role="tabpanel" hidden={tab !== 'security'}>
        {tab === 'security' && <ChangePasswordForm />}
      </Box>
    </Stack>
  );
}
