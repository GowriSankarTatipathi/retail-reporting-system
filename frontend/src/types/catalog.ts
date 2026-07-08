/** Mirrors dto/response/CategoryResponse.java. */
export interface Category {
  id: number;
  name: string;
  description: string | null;
}

/** Mirrors dto/request/CategoryRequest.java. */
export interface CategoryRequest {
  name: string;
  description?: string | null;
}

/** Mirrors dto/response/ProductResponse.java. */
export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  categoryId: number;
  categoryName: string;
  price: number;
  costPrice: number;
  active: boolean;
  quantityOnHand: number;
  reorderLevel: number;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mirrors dto/request/ProductRequest.java. `initialQuantity` is accepted by the
 * backend but only has an effect on create (see the Java doc comment on the field);
 * it is harmless, and ignored, on update.
 */
export interface ProductRequest {
  sku: string;
  name: string;
  description?: string | null;
  categoryId: number;
  price: number;
  costPrice: number;
  active?: boolean;
  initialQuantity?: number;
  reorderLevel?: number;
  warehouseLocation?: string | null;
}

/** Mirrors dto/response/InventoryResponse.java. */
export interface Inventory {
  productId: number;
  sku: string;
  productName: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string | null;
  lowStock: boolean;
  updatedAt: string;
}

/** Mirrors dto/request/InventoryAdjustRequest.java. Signed delta: positive = restock. */
export interface InventoryAdjustRequest {
  quantityDelta: number;
  reason?: string | null;
}

export interface ProductSearchParams {
  categoryId?: number;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
}
