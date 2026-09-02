import { majorTypes } from "./majors-types";
import { PaymentTypes } from "./payment-types";

// Account Bank Types
export interface AccountBankTypes {
  id: string;
  accountName: string;
  accountBank: string;
  accountNumber: string;
  majorId: string;
  isActive?: boolean;
  createdAt?: Date | string;
  // Relations
  majors?: majorTypes;
  /** Alias for majors — used in payment page dropdowns */
  major?: { id: string; name: string };
  payments?: PaymentTypes[];
}

interface MajorBankTypes {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  address?: string | null;
  phone?: string | null;
  adminName?: string | null;
  signatureUrl?: string | null;
}

// Dashboard/Chart types
export interface AccountBankSummary {
  totalAccountBanks: number;
  totalActiveAccountBanks: number;
  totalInactiveAccountBanks: number;
  totalRevenue: number;
  totalTransaction: number;
  totalPaymentItems: number;
  totalUnpaidItems: number;
  totalUnpaidAmount: number;
  collectionRate: number;
}

export interface AccountBankDetail {
  id: string;
  accountName: string;
  accountBank: string;
  accountNumber: string;
  isActive: boolean;
  major: MajorBankTypes | null;
  totalRevenue: number;
  totalTransaction: number;
  totalPaymentItems: number;
  totalUnpaidItems: number;
  totalUnpaidAmount: number;
  collectionRate: number;
  avgTransactionAmount: number;
}

export interface ByBankGroup {
  bankName: string;
  totalAccounts: number;
  totalRevenue: number;
  totalTransaction: number;
  collectionRate: number;
}

export interface RevenueMonthly {
  year: string;
  month: string;
  label: string;
  totalRevenue: number;
  totalTransaction: number;
}

export interface MonthlyByAccount {
  accountName: string;
  accountBank: string;
  year: string;
  month: string;
  totalRevenue: number;
  totalTransaction: number;
}

export interface TopAccount {
  rank: number;
  accountName: string;
  accountBank: string;
  accountNumber: string;
  majorName: string;
  totalRevenue: number;
  totalTransaction: number;
  percentage: number;
}

export interface DashboardResult {
  summary: AccountBankSummary;
  accountDetails: AccountBankDetail[];
  byBankGroup: ByBankGroup[];
  revenueMonthly: RevenueMonthly[];
  monthlyByAccount: MonthlyByAccount[];
  topAccounts: TopAccount[];
}

export interface AccountBankInput {
  id?: string;
  accountName: string;
  accountBank: string;
  accountNumber: string;
  majorId: string;
}
