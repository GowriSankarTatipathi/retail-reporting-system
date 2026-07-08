import { httpClient } from './client';
import { toPageableParams } from '@/utils/pagination';
import type {
  Customer,
  CustomerRequest,
  CustomerSearchParams,
  PageQuery,
  PageResponse,
} from '@/types';

/** GET /api/v1/customers - pagination, sorting, name/email search, state filter. */
export async function searchCustomers(
  params: CustomerSearchParams & PageQuery
): Promise<PageResponse<Customer>> {
  const { q, state, ...pageQuery } = params;
  const { data } = await httpClient.get<PageResponse<Customer>>('/customers', {
    params: { q, state, ...toPageableParams(pageQuery) },
  });
  return data;
}

/** GET /api/v1/customers/{id} */
export async function getCustomer(id: number): Promise<Customer> {
  const { data } = await httpClient.get<Customer>(`/customers/${id}`);
  return data;
}

/** POST /api/v1/customers - ADMIN, MANAGER */
export async function createCustomer(request: CustomerRequest): Promise<Customer> {
  const { data } = await httpClient.post<Customer>('/customers', request);
  return data;
}

/** PUT /api/v1/customers/{id} - ADMIN, MANAGER */
export async function updateCustomer(id: number, request: CustomerRequest): Promise<Customer> {
  const { data } = await httpClient.put<Customer>(`/customers/${id}`, request);
  return data;
}

/** DELETE /api/v1/customers/{id} - ADMIN only; fails (409) if orders reference it. */
export async function deleteCustomer(id: number): Promise<void> {
  await httpClient.delete(`/customers/${id}`);
}
