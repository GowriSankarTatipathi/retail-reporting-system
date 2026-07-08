import { z } from 'zod';

/** Mirrors dto/request/CustomerRequest.java's bean validation exactly. */
export const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Email must be a valid address'),
  phone: z.string().max(30).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  zipCode: z.string().max(20).optional().or(z.literal('')),
});
export type CustomerFormValues = z.infer<typeof customerSchema>;
