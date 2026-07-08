import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { RequireRole } from './RequireRole';
import { lazyRoute } from './lazyRoute';
import { DELETE_ROLES, REPORTING_ROLES } from '@/constants/permissions';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: lazyRoute(() => import('@/pages/auth/LoginPage')) },
          { path: '/register', element: lazyRoute(() => import('@/pages/auth/RegisterPage')) },
          {
            path: '/forgot-password',
            element: lazyRoute(() => import('@/pages/auth/ForgotPasswordPage')),
          },
          {
            path: '/reset-password',
            element: lazyRoute(() => import('@/pages/auth/ResetPasswordPage')),
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            path: '/dashboard',
            element: lazyRoute(() => import('@/pages/dashboard/DashboardPage')),
          },
          {
            path: '/categories',
            element: lazyRoute(() => import('@/pages/categories/CategoriesPage')),
          },
          { path: '/products', element: lazyRoute(() => import('@/pages/products/ProductsPage')) },
          {
            path: '/inventory',
            element: lazyRoute(() => import('@/pages/inventory/InventoryPage')),
          },
          {
            path: '/customers',
            element: lazyRoute(() => import('@/pages/customers/CustomersPage')),
          },
          { path: '/orders', element: lazyRoute(() => import('@/pages/orders/OrdersPage')) },
          { path: '/profile', element: lazyRoute(() => import('@/pages/profile/ProfilePage')) },
          {
            path: '/change-password',
            element: lazyRoute(() => import('@/pages/auth/ChangePasswordPage')),
          },
          {
            element: <RequireRole allowedRoles={REPORTING_ROLES} />,
            children: [
              { path: '/reports', element: lazyRoute(() => import('@/pages/reports/ReportsPage')) },
            ],
          },
          {
            element: <RequireRole allowedRoles={DELETE_ROLES} />,
            children: [
              { path: '/admin/users', element: lazyRoute(() => import('@/pages/admin/UsersPage')) },
            ],
          },
          { path: '/403', element: lazyRoute(() => import('@/pages/errors/ForbiddenPage')) },
        ],
      },
    ],
  },
  { path: '*', element: lazyRoute(() => import('@/pages/errors/NotFoundPage')) },
]);
