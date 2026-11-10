export const transactionTypes = [
    "Contribution",
    "Investment",
    "Expense",
] as const;
export type TransactionType = (typeof transactionTypes)[number];
export type TransactionForm = {
    description: string;
    type: string;
    date: string;
    amount: string;
    reference: string;
    notes: string;
};
export type DraftInput = Omit<TransactionForm, "type" | "amount"> & {
    type: TransactionType;
    amountMinor: number;
    receipt: File | null;
};
export type TransactionDraft = DraftInput & { id: string };
export type TransactionErrors = Partial<
    Record<keyof TransactionForm | "receipt", string>
>;

export function localToday(now = new Date()) {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function parseAmountMinor(value: string): number | null {
    const trimmed = value.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
    const [whole, fraction = ""] = trimmed.split(".");
    const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    if (!Number.isSafeInteger(minor) || minor <= 0) return null;
    const exactMinor = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
    if (BigInt(minor) !== exactMinor) return null;
    // Reject amounts that the number-based currency formatter cannot preserve
    // to the cent. Do not silently round large user-entered financial values.
    const displayed = new Intl.NumberFormat("en-NG", {
        useGrouping: false,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(minor / 100);
    return BigInt(displayed.replace(".", "")) === exactMinor ? minor : null;
}

export function receiptError(
    file: Pick<File, "name" | "type" | "size">,
): string | undefined {
    const types: Record<string, RegExp> = {
        "application/pdf": /\.pdf$/i,
        "image/jpeg": /\.jpe?g$/i,
        "image/png": /\.png$/i,
    };
    if (!types[file.type]?.test(file.name))
        return "Choose a PDF, JPEG, or PNG receipt.";
    if (!file.size) return "This file is empty. Choose another receipt.";
    if (file.size > 10 * 1024 * 1024)
        return "The receipt must be 10 MB or smaller.";
}

export function validateTransaction(
    form: TransactionForm,
    receipt: File | null,
    today = localToday(),
): TransactionErrors {
    const errors: TransactionErrors = {};
    if (!form.description.trim())
        errors.description = "Enter a description of the transaction.";
    else if (form.description.trim().length > 160)
        errors.description = "Use 160 characters or fewer.";
    if (!transactionTypes.includes(form.type as TransactionType))
        errors.type = "Choose a transaction type.";
    const date = new Date(`${form.date}T00:00:00Z`);
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(form.date) ||
        !Number.isFinite(date.getTime()) ||
        date.toISOString().slice(0, 10) !== form.date ||
        form.date < "1000-01-01"
    )
        errors.date = "Choose a valid transaction date.";
    else if (form.date > today)
        errors.date =
            "Use today or an earlier date for a transaction that has happened.";
    if (parseAmountMinor(form.amount) === null)
        errors.amount =
            "Enter a positive amount, with up to two decimal places.";
    if (form.reference.trim().length > 100)
        errors.reference = "Use 100 characters or fewer.";
    if (form.notes.trim().length > 1000)
        errors.notes = "Use 1,000 characters or fewer.";
    if (receipt) errors.receipt = receiptError(receipt);
    return Object.fromEntries(
        Object.entries(errors).filter(([, value]) => value),
    );
}

export function draftFingerprint(draft: DraftInput) {
    const identity = (draft.reference || draft.description)
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("en-NG");
    return JSON.stringify([
        draft.type,
        draft.date,
        draft.amountMinor,
        identity,
    ]);
}
