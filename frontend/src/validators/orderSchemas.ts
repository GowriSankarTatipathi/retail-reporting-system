import { z } from 'zod';

/** Mirrors dto/request/OrderItemRequest.java + OrderRequest.java's bean validation. */
export const orderSchema = z.object({
  customerId: z.number({ message: 'Customer is required' }).int().positive('Customer is required'),
  items: z
    .array(
      z.object({
        productId: z
          .number({ message: 'Product is required' })
          .int()
          .positive('Product is required'),
        quantity: z
          .number({ message: 'Quantity is required' })
          .int()
          .positive('Quantity must be greater than zero'),
      })
    )
    .min(1, 'An order must contain at least one line item'),
});
export type OrderFormValues = z.infer<typeof orderSchema>;
