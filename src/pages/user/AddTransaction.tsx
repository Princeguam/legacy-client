import { useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Paperclip } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Modal as Dialog } from "@/components/shared/Modal";
import { Card } from "@/components/shared/ui/card";
import { Alert } from "@/components/shared/ui/alert";
import { Input } from "@/components/shared/ui/input";
import { NativeSelect } from "@/components/shared/ui/native-select";
import { Textarea } from "@/components/shared/ui/textarea";
import { FormField } from "@/components/shared/form-field/form-field";
import { Currency } from "@/components/shared/currency/currency";
import { Receipt } from "@/components/shared/receipt/Receipt";
import { PageHeader } from "@/components/shared/product/PageHeader";
import { useProduct } from "@/components/shared/product/product-context";
import { useTransactionDrafts } from "@/context/transaction-drafts-context";
import {
    localToday,
    parseAmountMinor,
    receiptError,
    transactionTypes,
    validateTransaction,
    type TransactionForm,
    type TransactionErrors,
    type TransactionType,
} from "@/lib/transaction-drafts";

export function AddTransaction() {
    const { basePath, role } = useProduct();
    const { addDraft } = useTransactionDrafts();
    const navigate = useNavigate();
    const [form, setForm] = useState<TransactionForm>({
        description: "",
        type: "Contribution",
        date: localToday(),
        amount: "",
        reference: "",
        notes: "",
    });
    const [receipt, setReceipt] = useState<File | null>(null);
    const [errors, setErrors] = useState<TransactionErrors>({});
    const [review, setReview] = useState(false);
    const [duplicate, setDuplicate] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const saved = useRef(false);
    if (role !== "user")
        return <Navigate to={`${basePath}/transactions`} replace />;
    function update(key: keyof TransactionForm, value: string) {
        setForm((previous) => ({ ...previous, [key]: value }));
        setErrors((previous) => ({ ...previous, [key]: undefined }));
        setDuplicate(false);
    }
    function reviewTransaction(event: FormEvent) {
        event.preventDefault();
        const next = {
            ...validateTransaction(form, receipt),
            ...(errors.receipt ? { receipt: errors.receipt } : {}),
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) {
            const order: (keyof TransactionErrors)[] = ["type", "date", "amount", "reference", "description", "notes", "receipt"];
            const first = order.find(key => next[key]);
            formRef.current
                ?.querySelector<HTMLElement>(`[name="${first}"]`)
                ?.focus();
            return;
        }
        setReview(true);
    }
    function save() {
        if (saved.current) return;
        const next = validateTransaction(form, receipt);
        if (Object.values(next).some(Boolean)) {
            setErrors(next);
            setReview(false);
            return;
        }
        const added = addDraft({
            ...form,
            description: form.description.trim(),
            type: form.type as TransactionType,
            reference: form.reference.trim(),
            notes: form.notes.trim(),
            amountMinor: parseAmountMinor(form.amount)!,
            receipt,
        });
        if (!added) {
            setDuplicate(true);
            return;
        }
        saved.current = true;
        navigate(`${basePath}/transactions`, { state: { draftSaved: true } });
    }
    return (
        <div className="page-stack">
            <PageHeader
                title="Add transaction"
                description="Record a transaction that has already happened and keep its receipt together."
                actions={
                    <Link
                        to={`${basePath}/transactions`}
                        className="standalone-link type-label">
                        <ArrowLeft aria-hidden="true" />
                        Back to transactions
                    </Link>
                }
            />
            <Alert title="Local draft">
                <p>
                    Entries and receipts stay in this workspace’s memory. They
                    are not submitted and do not change balances. Reloading,
                    signing out, or switching workspace clears them.
                </p>
            </Alert>
            <form
                ref={formRef}
                onSubmit={reviewTransaction}
                noValidate
                className="page-stack">
                <Card className="product-card">
                    <h2 className="type-title">Transaction details</h2>
                    <div className="form-grid">
                        <FormField label="Transaction type" error={errors.type}>
                            {(bindings) => (
                                <NativeSelect
                                    {...bindings}
                                    name="type"
                                    value={form.type}
                                    onChange={(event) =>
                                        update("type", event.target.value)
                                    }>
                                    {transactionTypes.map((type) => (
                                        <option key={type}>{type}</option>
                                    ))}
                                </NativeSelect>
                            )}
                        </FormField>
                        <FormField
                            label="Transaction date"
                            hint="The date it happened, today or earlier."
                            error={errors.date}>
                            {(bindings) => (
                                <Input
                                    {...bindings}
                                    name="date"
                                    type="date"
                                    required
                                    min="1000-01-01"
                                    max={localToday()}
                                    value={form.date}
                                    onChange={(event) =>
                                        update("date", event.target.value)
                                    }
                                />
                            )}
                        </FormField>
                        <FormField
                            label="Amount (NGN)"
                            hint="Nigerian naira. Use a decimal point, for example 80000.00."
                            error={errors.amount}>
                            {(bindings) => (
                                <Input
                                    {...bindings}
                                    name="amount"
                                    inputMode="decimal"
                                    required
                                    value={form.amount}
                                    onChange={(event) =>
                                        update("amount", event.target.value)
                                    }
                                />
                            )}
                        </FormField>
                        <FormField
                            label="Payment reference (optional)"
                            hint="The reference on your bank confirmation or receipt."
                            error={errors.reference}>
                            {(bindings) => (
                                <Input
                                    {...bindings}
                                    name="reference"
                                    className="financial"
                                    maxLength={100}
                                    value={form.reference}
                                    onChange={(event) =>
                                        update("reference", event.target.value)
                                    }
                                />
                            )}
                        </FormField>
                    </div>
                    <FormField label="Description" error={errors.description}>
                        {(bindings) => (
                            <Input
                                {...bindings}
                                name="description"
                                required
                                maxLength={160}
                                value={form.description}
                                onChange={(event) =>
                                    update("description", event.target.value)
                                }
                                placeholder="For example, November cooperative contribution"
                            />
                        )}
                    </FormField>
                    <FormField label="Notes (optional)" error={errors.notes}>
                        {(bindings) => (
                            <Textarea
                                {...bindings}
                                name="notes"
                                rows={4}
                                maxLength={1000}
                                value={form.notes}
                                onChange={(event) =>
                                    update("notes", event.target.value)
                                }
                            />
                        )}
                    </FormField>
                </Card>
                <Card className="product-card">
                    <h2 className="type-title">Receipt</h2>
                    <FormField
                        label="Attach receipt (optional)"
                        hint="One PDF, JPEG, or PNG, up to 10 MB. Kept locally with this draft."
                        error={errors.receipt}>
                        {(bindings) => (
                            <div className="receipt-picker">
                                <Paperclip aria-hidden="true" />
                                <Input
                                    {...bindings}
                                    ref={fileRef}
                                    name="receipt"
                                    type="file"
                                    accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (!file) return;
                                        const error = receiptError(file);
                                        setErrors((previous) => ({
                                            ...previous,
                                            receipt: error,
                                        }));
                                        if (!error) {
                                            setReceipt(file);
                                            setDuplicate(false);
                                        }
                                        event.target.value = "";
                                    }}
                                />
                            </div>
                        )}
                    </FormField>
                    {errors.receipt && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setErrors((previous) => ({
                                    ...previous,
                                    receipt: undefined,
                                }));
                                fileRef.current?.focus();
                            }}>
                            Dismiss file error
                            {receipt ? " and keep current receipt" : ""}
                        </Button>
                    )}
                    {receipt && (
                        <Receipt
                            file={receipt}
                            onRemove={() => {
                                setReceipt(null);
                                setErrors((previous) => ({
                                    ...previous,
                                    receipt: undefined,
                                }));
                                if (fileRef.current) fileRef.current.value = "";
                                fileRef.current?.focus();
                            }}
                        />
                    )}
                </Card>
                {Object.values(errors).some(Boolean) && (
                    <p role="alert" className="field-error">
                        Check the highlighted fields. Your entries and accepted
                        receipt are preserved.
                    </p>
                )}
                <div className="inline-actions">
                    <Link
                        to={`${basePath}/transactions`}
                        className="standalone-link">
                        Cancel
                    </Link>
                    <Button type="submit" primaryAction>
                        Review transaction
                    </Button>
                </div>
            </form>
            <Dialog
                open={review}
                onOpenChange={setReview}
                title="Review transaction"
                description="Check the details before saving this local draft. This does not submit a payment or transaction."
                footer={<Button onClick={save}>Save transaction draft</Button>}>
                <dl className="detail-list">
                    <div>
                        <dt>Type</dt>
                        <dd>{form.type}</dd>
                    </div>
                    <div>
                        <dt>Date</dt>
                        <dd>{form.date}</dd>
                    </div>
                    <div>
                        <dt>Amount</dt>
                        <dd>
                            <Currency
                                value={
                                    (parseAmountMinor(form.amount) ?? 0) / 100
                                }
                            />
                        </dd>
                    </div>
                    <div>
                        <dt>Description</dt>
                        <dd>{form.description}</dd>
                    </div>
                    <div>
                        <dt>Payment reference</dt>
                        <dd className="financial">
                            {form.reference || "Not provided"}
                        </dd>
                    </div>
                    <div>
                        <dt>Receipt</dt>
                        <dd>{receipt?.name || "None attached"}</dd>
                    </div>
                    <div>
                        <dt>Fees</dt>
                        <dd>No fee for saving a local draft.</dd>
                    </div>
                </dl>
                {form.notes && (
                    <p className="transaction-notes">{form.notes}</p>
                )}
                {duplicate && (
                    <Alert
                        tone="warning"
                        title="Draft already exists"
                        role="alert">
                        <p>
                            A draft with the same type, date, amount, and
                            reference or description is already saved. Cancel to
                            edit your entry or return to transactions.
                        </p>
                    </Alert>
                )}
            </Dialog>
        </div>
    );
}
