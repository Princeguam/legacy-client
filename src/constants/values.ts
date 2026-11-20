import tokens from "@/design-system/tokens.json";
import { MIME_TYPES } from "./strings";

export const API_REQUEST_TIMEOUT_MS = 20_000;
export const UPLOAD_TIMEOUT_MS = 120_000;
export const TOAST_DURATION_MS = 6_000;
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const AUTH_REQUEST_TIMEOUT_MS = API_REQUEST_TIMEOUT_MS;
export const MAX_TIMER_DELAY_MS = 2_147_483_647;
export const MONEY_DECIMAL_PLACES = 2;
export const MONEY_MINOR_UNIT_FACTOR = 100;
export const PAGE_SIZES = {
    transactions: 10,
    members: 10,
    notifications: 10,
    feedback: 10,
    bankAccounts: 10,
} as const;
export const API_ID_MAX = 2_147_483_647;
// Enable a page only after its live backend integration is ready.
export const MAX_PAYMENT_MINOR = 9_223_372_036_854_775_807n;
export const TRANSACTION_LIMITS = {
    notes: 1_000,
    receiptBytes: UPLOAD_MAX_BYTES,
} as const;
export const FEEDBACK_SUBJECT_MAX_LENGTH = 120;
export const CURRENT_YEAR = new Date().getFullYear();
// Read approved dimensions from their existing authority; do not duplicate tokens.
export const WORKSPACE_DESKTOP_MIN_WIDTH = tokens.breakpoints.md;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const RECEIPT_EXTENSIONS: Readonly<Record<string, RegExp>> = {
    [MIME_TYPES.pdf]: /\.pdf$/i,
    [MIME_TYPES.jpeg]: /\.jpe?g$/i,
    [MIME_TYPES.png]: /\.png$/i,
};
