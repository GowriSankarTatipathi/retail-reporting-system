import { useState } from 'react';
import { Avatar, Box, Card, CardContent, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { UpdateProfileForm } from '@/components/forms/UpdateProfileForm';
import { ChangePasswordForm } from '@/components/forms/ChangePasswordForm';
import { formatDate, initialsOf } from '@/utils/format';

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'profile' | 'security'>('profile');

  return (
    <Stack spacing={3}>
      <Typography variant="h5" component="h1">
        Profile
      </Typography>

      {user && (
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ width: 56, height: 56, fontSize: 20 }}>
                {initialsOf(user.fullName)}
              </Avatar>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="h6" noWrap>
                  {user.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              </Box>
              <Stack spacing={0.5} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                <Chip label={user.role} color="primary" size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  Member since {formatDate(user.createdAt)}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

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
