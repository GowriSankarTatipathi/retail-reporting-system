/** Mirrors dto/response/CustomerResponse.java. */
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  createdAt: string;
}

/** Mirrors dto/request/CustomerRequest.java. */
export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

export interface CustomerSearchParams {
  q?: string;
  state?: string;
}
