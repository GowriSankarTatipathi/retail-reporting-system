/** Mirrors domain/entity/OrderStatus.java's lifecycle states. */
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

/**
 * Mirrors OrderStatus.allowedNextStates() in the backend - kept in sync by hand.
 * Used purely for UI affordances (e.g. disabling invalid transition buttons);
 * the backend re-validates and is the source of truth on every request.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

/** Mirrors dto/response/OrderItemResponse.java. */
export interface OrderItem {
  productId: number;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/** Mirrors dto/response/OrderResponse.java. */
export interface Order {
  id: number;
  customerId: number;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  orderDate: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

/** Mirrors dto/request/OrderItemRequest.java. */
export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

/** Mirrors dto/request/OrderRequest.java. Totals are always computed server-side. */
export interface OrderRequest {
  customerId: number;
  items: OrderItemRequest[];
}

/** Mirrors dto/request/OrderStatusUpdateRequest.java. */
export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}

export interface OrderSearchParams {
  customerId?: number;
  status?: OrderStatus;
  /** ISO-8601 date-time strings (LocalDateTime, no timezone offset), matching the backend. */
  start?: string;
  end?: string;
}
