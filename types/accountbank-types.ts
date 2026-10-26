import { type branchTypes } from "./branchs-types";
import { type PaymentTypes } from "./payment-types";

// Account Bank Types
export interface AccountBankTypes {
  id: string;
  accountName: string;
  accountBank: string;
  accountNumber: string;
  branchId: string;
  isActive?: boolean;
  createdAt?: Date | string;
  // Relations
  branchs?: branchTypes;
  /** Alias for branchs — used in payment page dropdowns */
  branch?: { id: string; name: string };
  payments?: PaymentTypes[];
}

interface BranchBankTypes {
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
  branch: BranchBankTypes | null;
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
  branchName: string;
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
  branchId: string;
}
