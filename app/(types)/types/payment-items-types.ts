// ─── Payment Item Data ────────────────────────────────────────────────────────
// Primary type used across billing, bendahara/payment, and payments pages.
export interface PaymentItemData {
  id: string;
  paymentId?: string | null;
  studentId: string;
  paymentTypeId: string;
  month: string;
  year: string;
  isPaid: boolean;
  isMonthly: boolean;
  isActive: boolean;
  isFixedAmount: boolean;
  isFixedQuantity: boolean;
  quantity: number;
  amount: number;
  subtotal: number;
  name: string;
  skuType: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Relations — lowercase `paymentType` matches both pages
  paymentType?: PaymentTypeItemData;
  // Capital `PaymentType` alias so billing page (which uses capital) also works
  PaymentType?: PaymentTypeItemData;
  student?: {
    id: string;
    name: string;
    class?: { name: string } | null;
    major?: { id: string; name: string } | null;
    email?: string | null;
    nisn?: string | null;
  };
  payment?: {
    id: string;
    receiptNumber: string;
    status: string;
    accountBankId?: string;
    paymentDate?: Date | string;
    accountBank?: {
      id: string;
      accountName: string;
      accountBank: string;
      accountNumber: string;
    };
  };
}

// ─── PaymentType relation (minimal, for item display) ────────────────────────
export interface PaymentTypeItemData {
  id: string;
  name: string;
  description?: string;
  amount: number | string;
  isMonthly: boolean;
  isActive: boolean;
  skuType: string;
  owner: string;
}

// ─── Input for create/update ──────────────────────────────────────────────────
export interface PaymentItemsInput {
  id?: string;
  studentId: string;
  paymentTypeId: string;
  quantity?: number | string;
  amount?: number;
  subtotal: number;
  isPaid?: boolean;
  month: string;
  name: string;
  year: string;
  skuType?: string;
}

// ─── Filter types ─────────────────────────────────────────────────────────────
export interface PaymentItemsFilterTypes {
  startDate?: Date | string;
  endDate?: Date | string;
  majorId?: string;
  status?: string;
  isPaid?: boolean;
  skuType?: string;
}

// ─── Backward-compat alias ────────────────────────────────────────────────────
/** @deprecated Use PaymentItemData instead */
export type PaymentItemsTypes = PaymentItemData & { length?: number };
