import { httpClient } from './client';
import { toPageableParams } from '@/utils/pagination';
import type {
  Order,
  OrderRequest,
  OrderSearchParams,
  OrderStatus,
  PageQuery,
  PageResponse,
} from '@/types';

/** GET /api/v1/orders - pagination, sorting, customer/status/date-range filters. */
export async function searchOrders(
  params: OrderSearchParams & PageQuery
): Promise<PageResponse<Order>> {
  const { customerId, status, start, end, ...pageQuery } = params;
  const { data } = await httpClient.get<PageResponse<Order>>('/orders', {
    params: { customerId, status, start, end, ...toPageableParams(pageQuery) },
  });
  return data;
}

/** GET /api/v1/orders/{id} */
export async function getOrder(id: number): Promise<Order> {
  const { data } = await httpClient.get<Order>(`/orders/${id}`);
  return data;
}

/**
 * POST /api/v1/orders - ADMIN, MANAGER. The backend computes unit prices and
 * totals from current product prices; it never trusts client-supplied totals.
 * Returns 409 if any line item exceeds available stock (whole order rolled back).
 */
export async function createOrder(request: OrderRequest): Promise<Order> {
  const { data } = await httpClient.post<Order>('/orders', request);
  return data;
}

/**
 * PATCH /api/v1/orders/{id}/status - ADMIN, MANAGER. Only forward transitions
 * are allowed (see types/order.ts's ORDER_STATUS_TRANSITIONS); the backend
 * re-validates regardless of what the UI allows. Returns 409 on an invalid
 * transition. Cancelling releases reserved stock.
 */
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const { data } = await httpClient.patch<Order>(`/orders/${id}/status`, { status });
  return data;
}
