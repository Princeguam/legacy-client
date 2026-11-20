import type { PAYMENT_SORTS, PAYMENT_STATUS, PAYMENT_TYPE, SERVER_MEMBER_ROLE, USER_ROLES } from '@/constants/strings'
import type { PaginatedApiData } from './api'
import type { BankAccount } from './bank-account'
export type TransactionForm = {
    bankAccountId: string;
    period: string;
    date: string;
    amount: string;
    notes: string;
};
export type DraftInput = Omit<TransactionForm, "bankAccountId" | "amount"> & {
    bankAccountId: number;
    amountMinor: string;
    receipt: File | null;
};
export type TransactionDraft = DraftInput & { id: string };
export type TransactionErrors = Partial<
    Record<keyof TransactionForm | "receipt", string>
>;
export type TransactionDraftsContextValue = {
    drafts: TransactionDraft[];
    addDraft: (draft: DraftInput) => boolean;
    removeDraft: (id: string) => void;
};

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]
export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE]
export type PaymentPerson = {
  id: number; firstName: string; middleName: string | null; lastName: string; email: string
  role: typeof SERVER_MEMBER_ROLE | typeof USER_ROLES.admin
}
/** API BigInt amounts are normalized to exact integer kobo strings, never numbers. */
export type ApiTransaction = {
  id: number; bankAccountId: number; userId: number; status: PaymentStatus; type: PaymentType
  amount: string; currency: string; note: string | null; source: 'User' | 'Admin'
  attachmentUrl: string | null; reviewedById: number | null; period: string
  depositedAt: string | null; reviewedAt: string | null; created: string; updated: string
  depositedBy: PaymentPerson; reviewedBy: PaymentPerson | null; bankAccount: BankAccount
}
export type TransactionListData = PaginatedApiData<ApiTransaction>
export type PaymentSort = keyof typeof PAYMENT_SORTS
export type TransactionListQuery = { page: number; sort: PaymentSort; search: string; status: PaymentStatus | ''; from: string; to: string }
export type CreateTransactionRequest = { bankAccountId: number; amount: string; period: string; note?: string; depositedAt?: string; attachmentUrl: string }
export type AdminCreateTransactionRequest = Omit<CreateTransactionRequest, 'attachmentUrl'> & { memberId: number; attachmentUrl?: string }
