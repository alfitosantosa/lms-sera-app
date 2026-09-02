// ─── Payment Data ─────────────────────────────────────────────────────────────
// Primary type used across both payment pages and hooks.
export interface PaymentData {
  id: string;
  studentId: string;
  bendaharaId: string;
  amount: number | string;
  dueDate?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  paymentDate: string;
  transferDate: string;
  receiptNumber: string;
  bankRef: string;
  accountBankId: string;
  majorId: string;
  month: string;
  // Relations
  student?: {
    id: string;
    name: string;
    parentPhone?: string | null;
    class?: { name: string } | null;
    major?: { id: string; name: string } | null;
    nisn?: string | null;
    email?: string | null;
  };
  major?: {
    id: string;
    name: string;
    adminName?: string | null;
    signatureUrl?: string | null;
    code?: string;
  };
  accountBank?: {
    id: string;
    accountName: string;
    accountBank?: string;
    accountNumber: string;
  };
  paymentItems?: import("./payment-items-types").PaymentItemData[];
  paymentTransaction?: PaymentTransactionData | null;
  createdBy?: {
    id: string;
    name: string;
    email?: string | null;
  };
}

// ─── Payment Transaction ──────────────────────────────────────────────────────
export interface PaymentTransactionData {
  id: string;
  paymentId: string;
  transactionId: string;
  orderId: string;
  grossAmount: number | string;
  paymentType: string;
  transactionTime: Date | string;
  transactionStatus: string;
  fraudStatus: string;
  finishRedirectUrl: string;
  createdAt?: Date | string;
  payment?: PaymentData;
}

// ─── Input for create/update ──────────────────────────────────────────────────
export interface PaymentInput {
  id?: string;
  studentId: string;
  bendaharaId: string;
  majorId: string;
  accountBankId: string;
  month: string;
  amount: number;
  status: string;
  paymentDate: string;
  transferDate?: string;
  dueDate?: string;
  receiptNumber: string;
  bankRef: string;
  notes?: string | null;
}

// ─── Input for marking items as paid ─────────────────────────────────────────
export interface SetPaidInput {
  paymentItemsIds: string[];
  paymentId: string;
}

// ─── Backward-compat aliases (used by non-payment hooks/pages) ────────────────
/** @deprecated Use PaymentData instead */
export type PaymentTypes = PaymentData;
/** @deprecated Use PaymentTransactionData instead */
export type PaymentTransactionTypes = PaymentTransactionData;
