import { z } from 'zod';

/** Mirrors dto/request/CategoryRequest.java's bean validation exactly. */
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be at most 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

/** Mirrors dto/request/ProductRequest.java's bean validation exactly. */
export const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU must be at most 50 characters'),
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be at most 200 characters'),
  description: z
    .string()
    .max(4000, 'Description must be at most 4000 characters')
    .optional()
    .or(z.literal('')),
  categoryId: z.number({ message: 'Category is required' }).int().positive('Category is required'),
  price: z.number({ message: 'Price is required' }).min(0, 'Price must not be negative'),
  costPrice: z
    .number({ message: 'Cost price is required' })
    .min(0, 'Cost price must not be negative'),
  active: z.boolean(),
  initialQuantity: z.number().int().min(0, 'Initial quantity must not be negative').optional(),
  reorderLevel: z.number().int().min(0, 'Reorder level must not be negative').optional(),
  warehouseLocation: z.string().optional().or(z.literal('')),
});
export type ProductFormValues = z.infer<typeof productSchema>;

/** Mirrors dto/request/InventoryAdjustRequest.java. */
export const inventoryAdjustSchema = z.object({
  quantityDelta: z
    .number({ message: 'Quantity delta is required' })
    .int('Quantity delta must be a whole number')
    .refine((value) => value !== 0, 'Quantity delta must not be zero'),
  reason: z.string().optional().or(z.literal('')),
});
export type InventoryAdjustFormValues = z.infer<typeof inventoryAdjustSchema>;
