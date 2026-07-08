import { httpClient } from './client';
import { toPageableParams } from '@/utils/pagination';
import type {
  Inventory,
  InventoryAdjustRequest,
  PageQuery,
  PageResponse,
  Product,
  ProductRequest,
  ProductSearchParams,
} from '@/types';

/** GET /api/v1/products - pagination, sorting, category/active/price filters, free-text search. */
export async function searchProducts(
  params: ProductSearchParams & PageQuery
): Promise<PageResponse<Product>> {
  const { categoryId, active, minPrice, maxPrice, q, ...pageQuery } = params;
  const { data } = await httpClient.get<PageResponse<Product>>('/products', {
    params: { categoryId, active, minPrice, maxPrice, q, ...toPageableParams(pageQuery) },
  });
  return data;
}

/** GET /api/v1/products/{id} */
export async function getProduct(id: number): Promise<Product> {
  const { data } = await httpClient.get<Product>(`/products/${id}`);
  return data;
}

/** POST /api/v1/products - ADMIN, MANAGER */
export async function createProduct(request: ProductRequest): Promise<Product> {
  const { data } = await httpClient.post<Product>('/products', request);
  return data;
}

/** PUT /api/v1/products/{id} - ADMIN, MANAGER */
export async function updateProduct(id: number, request: ProductRequest): Promise<Product> {
  const { data } = await httpClient.put<Product>(`/products/${id}`, request);
  return data;
}

/** DELETE /api/v1/products/{id} - soft delete (deactivate); ADMIN, MANAGER */
export async function deactivateProduct(id: number): Promise<void> {
  await httpClient.delete(`/products/${id}`);
}

/** GET /api/v1/products/{id}/inventory */
export async function getProductInventory(id: number): Promise<Inventory> {
  const { data } = await httpClient.get<Inventory>(`/products/${id}/inventory`);
  return data;
}

/** PATCH /api/v1/products/{id}/inventory - restock or write-off; ADMIN, MANAGER */
export async function adjustProductInventory(
  id: number,
  request: InventoryAdjustRequest
): Promise<Inventory> {
  const { data } = await httpClient.patch<Inventory>(`/products/${id}/inventory`, request);
  return data;
}
