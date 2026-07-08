/** Mirrors dto/report/ReportGranularity.java. */
export type ReportGranularity = 'DAILY' | 'MONTHLY';

/** Mirrors dto/report/DashboardSummary.java (GET /api/v1/dashboard/summary). */
export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeCustomers: number;
  lowStockCount: number;
  generatedAt: string;
}

/** Mirrors dto/report/SalesSummary.java (GET /api/v1/reports/sales-summary). */
export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

/** Mirrors dto/report/RevenueTrendPoint.java (GET /api/v1/reports/revenue-trend). */
export interface RevenueTrendPoint {
  period: string;
  revenue: number;
  orderCount: number;
}

/** Mirrors dto/report/TopProductPoint.java (GET /api/v1/reports/top-products). */
export interface TopProductPoint {
  productId: number;
  sku: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

/** Mirrors dto/report/TopCustomerPoint.java (GET /api/v1/reports/top-customers). */
export interface TopCustomerPoint {
  customerId: number;
  customerName: string;
  email: string;
  totalSpent: number;
  orderCount: number;
}

/** Mirrors dto/report/LowStockItem.java (GET /api/v1/reports/low-stock). */
export interface LowStockItem {
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  quantityOnHand: number;
  reorderLevel: number;
  warehouseLocation: string | null;
}

export interface DateRangeParams {
  /** ISO-8601 date-time strings (LocalDateTime, no timezone offset), matching the backend. */
  start: string;
  end: string;
}

export type ExportFormat = 'csv' | 'pdf';
