import type { ComponentType } from 'react';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import type { Role } from '@/types';

export interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<{ fontSize?: 'small' | 'medium' | 'large' }>;
  /** Omit to show to every authenticated role - mirrors docs/api.md's role matrix. */
  allowedRoles?: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon },
  { label: 'Categories', path: '/categories', icon: CategoryOutlinedIcon },
  { label: 'Products', path: '/products', icon: Inventory2OutlinedIcon },
  { label: 'Inventory', path: '/inventory', icon: WarehouseOutlinedIcon },
  { label: 'Customers', path: '/customers', icon: PeopleAltOutlinedIcon },
  { label: 'Orders', path: '/orders', icon: ReceiptLongOutlinedIcon },
  {
    label: 'Reports',
    path: '/reports',
    icon: AssessmentOutlinedIcon,
    allowedRoles: ['ADMIN', 'MANAGER', 'ANALYST'],
  },
  {
    label: 'Administration',
    path: '/admin/users',
    icon: AdminPanelSettingsOutlinedIcon,
    allowedRoles: ['ADMIN'],
  },
];
