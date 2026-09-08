// ─── PaymentType for page forms / dropdowns ───────────────────────────────────
// This is what both payment pages call "PaymentTypeData".
export interface PaymentTypeForPage {
  id: string;
  name: string;
  description?: string;
  amount: string | number;
  isMonthly: boolean;
  isActive: boolean;
  isFixedAmount: boolean;
  isFixedQuantity: boolean;
  quantity: number | string;
  subtotal: string | number;
  owner: string;
  majorId: string;
  skuType: string;
  major?: { id: string; name: string };
  student?: {
    class?: { name: string };
  };
}

// ─── Full PaymentType (from API / Prisma) ─────────────────────────────────────
export interface PaymentTypeTypes {
  id: string;
  name: string;
  description: string;
  amount: number;
  isMonthly: boolean;
  isActive: boolean;
  isFixedAmount: boolean;
  isFixedQuantity: boolean;
  quantity: number;
  subtotal: number | string;
  owner: string;
  majorId: string;
  skuType: string;
  // Relations
  major?: MajorPaymentTypeTypes;
  paymentItems?: PaymentItemPaymentTypeTypes[];
}

interface MajorPaymentTypeTypes {
  id: string;
  code: string;
  name: string;
}

interface PaymentItemPaymentTypeTypes {
  id: string;
  name: string;
  amount: number | string;
  subtotal: number | string;
  isPaid: boolean;
}

// ─── Input for create/update ──────────────────────────────────────────────────
export interface PaymentTypeInput {
  id?: string;
  name: string;
  description: string;
  amount: number;
  isMonthly?: boolean;
  isActive?: boolean;
  isFixedAmount: boolean;
  isFixedQuantity: boolean;
  quantity: number;
  subtotal: number;
  owner: string;
  majorId: string;
  skuType: string;
}

// ─── Backward-compat alias ────────────────────────────────────────────────────
/** @deprecated Use PaymentTypeForPage for form/display usage */
export type PaymentTypeData = PaymentTypeForPage;
