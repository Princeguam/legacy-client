import { FeedbackList } from '@/components/shared/feedback/FeedbackList'
import { notify } from '@/lib/notify'
import { RequestRecovery } from '@/components/shared/product/RequestRecovery'
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MessageSquare, Plus, RefreshCw } from "lucide-react";
import {
    COMMON_LABELS,
    FEEDBACK_MESSAGES,
    FEEDBACK_SORTS,
    PAGE_LABELS,
    PAGE_PATHS,
} from "@/constants/strings";
import { PAGE_SIZES } from "@/constants/values";
import type { AuthSession } from "@/types/Auth";
import type {
    ApiFeedback,
    FeedbackListData,
    FeedbackListQuery,
} from "@/types/feedback";
import { useAuth } from "@/context/useAuth";
import { useProduct } from "@/components/shared/product/product-context";
import {
    feedbackQuery,
    getPreviewFeedback,
} from "@/lib/feedback";
import { getFeedback, getFeedbacks } from "@/services/adminService";
import { isValidSession } from "@/services/authService";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/ui/card";
import { NativeSelect } from "@/components/shared/ui/native-select";
import { Modal as Dialog } from "@/components/shared/Modal";
import { FormField } from "@/components/shared/form-field/form-field";
import { PageHeader } from "@/components/shared/product/PageHeader";
import { PageLoader } from "@/components/shared/page-loader/PageLoader";
import { FeedbackDetails } from "@/components/shared/feedback/FeedbackDetails";
import "@/components/shared/feedback/feedback.css";

function FeedbackDetail({
    record,
    session,
    preview,
}: {
    record: ApiFeedback;
    session: AuthSession | null;
    preview: boolean;
}) {
    const [data, setData] = useState<ApiFeedback | null>(
        preview ? record : null,
    );
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        if (preview || !session) return;
        const controller = new AbortController();
        getFeedback(session, record.id, controller.signal)
            .then((feedback) => {
                if (!controller.signal.aborted && isValidSession(session))
                    setData(feedback);
            })
            .catch((error) => {
                if (!controller.signal.aborted)
                    { setError('failed'); notify.error(error, FEEDBACK_MESSAGES.loadFailed); }
            });
        return () => controller.abort();
    }, [session, record.id, preview, attempt]);
    if (error) return <RequestRecovery onRetry={() => { setError(''); setAttempt(value => value + 1) }} />;
    return data ? <FeedbackDetails feedback={data} /> : <PageLoader />;
}

function FeedbackInbox({
    session,
    preview,
    query,
    onPageChange,
}: {
    session: AuthSession | null;
    preview: boolean;
    query: FeedbackListQuery;
    onPageChange: (page: number) => void;
}) {
    const [data, setData] = useState<FeedbackListData | null>(() =>
        preview ? getPreviewFeedback(query) : null,
    );
    const [loading, setLoading] = useState(!preview);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const [selected, setSelected] = useState<ApiFeedback | null>(null);
    const { page, sort } = query;
    useEffect(() => {
        if (preview || !session) return;
        const controller = new AbortController();
        getFeedbacks(session, { page, sort }, controller.signal)
            .then((result) => {
                if (controller.signal.aborted || !isValidSession(session))
                    return;
                if (page > Math.max(1, result.totalPages)) {
                    onPageChange(Math.max(1, result.totalPages));
                    return;
                }
                setData(result);
                setLoading(false);
            })
            .catch((error) => {
                if (!controller.signal.aborted) {
                    { setError('failed'); notify.error(error, FEEDBACK_MESSAGES.loadFailed); }
                    setLoading(false);
                }
            });
        return () => controller.abort();
    }, [session, preview, page, sort, attempt, onPageChange]);

    function refresh() {
        setLoading(true);
        setError("");
        setAttempt((value) => value + 1);
    }
    return (
        <>
            <Card className="product-card" aria-busy={loading || undefined}>
                <div className="card-heading">
                    <h2 className="type-title">
                        {FEEDBACK_MESSAGES.listTitle}
                    </h2>
                    {!preview && (
                        <Button
                            variant="outline"
                            loading={loading}
                            onClick={refresh}>
                            <RefreshCw aria-hidden="true" />
                            {FEEDBACK_MESSAGES.refresh}
                        </Button>
                    )}
                </div>
                {error && <RequestRecovery stale={!!data} onRetry={refresh} />}
                {loading && <PageLoader />}
                {data && (
                    <>
                        <p className="type-label" role="status">
                            {data.totalItems} feedback records ·{" "}
                            {FEEDBACK_SORTS[sort].label}
                            {error ? " · last loaded data" : ""}
                        </p>
                        {!data.pageData.length ? (
                            <div className="empty-state">
                                <MessageSquare aria-hidden="true" />
                                <p>{FEEDBACK_MESSAGES.empty}</p>
                            </div>
                        ) : (
                            <FeedbackList rows={data.pageData} disabled={loading || !!error} onSelect={setSelected} />
                        )}
                        {data.totalPages > 1 && (
                            <div className="pagination">
                                <p className="type-label">
                                    {(page - 1) * PAGE_SIZES.feedback + 1}–
                                    {(page - 1) * PAGE_SIZES.feedback +
                                        data.count}{" "}
                                    of {data.totalItems}
                                </p>
                                <nav
                                    className="pagination-controls"
                                    aria-label="Feedback pagination">
                                    <Button
                                        variant="outline"
                                        disabled={
                                            loading || !!error || page === 1
                                        }
                                        onClick={() => onPageChange(page - 1)}>
                                        {COMMON_LABELS.previous}
                                    </Button>
                                    <span className="type-label">
                                        Page {page} of {data.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={
                                            loading ||
                                            !!error ||
                                            page >= data.totalPages
                                        }
                                        onClick={() => onPageChange(page + 1)}>
                                        {COMMON_LABELS.next}
                                    </Button>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </Card>
            <Dialog
                open={selected !== null}
                onOpenChange={(open) => {
                    if (!open) setSelected(null);
                }}
                title={FEEDBACK_MESSAGES.view}
                description={
                    preview
                        ? "Feedback layout preview."
                        : "Feedback submitted to the cooperative."
                }>
                {selected && (
                    <FeedbackDetail
                        key={selected.id}
                        record={selected}
                        session={session}
                        preview={preview}
                    />
                )}
            </Dialog>
        </>
    );
}

export function Feedback() {
    const { preview, basePath } = useProduct();
    const { session } = useAuth();
    const [params, setParams] = useSearchParams();
    const query = feedbackQuery(params);
    const search = params.toString();
    const onPageChange = useCallback(
        (page: number) => {
            const next = new URLSearchParams(search);
            next.set("page", String(page));
            setParams(next);
        },
        [search, setParams],
    );
    return (
        <div className="page-stack feedback-list-page">
            <PageHeader
                title={PAGE_LABELS.feedback}
                description={
                    preview
                        ? "Feedback layout preview. No account data."
                        : "Review feedback submitted by cooperative members and administrators."
                }
                actions={
                    <Link
                        to={`${basePath}/${PAGE_PATHS.newFeedback}`}
                        className="action-link">
                        <Plus aria-hidden="true" />
                        {FEEDBACK_MESSAGES.create}
                    </Link>
                }
            />
            <Card className="product-card">
                <div className="feedback-sort">
                    <FormField label="Sort feedback">
                        {(bindings) => (
                            <NativeSelect
                                {...bindings}
                                value={query.sort}
                                onChange={(event) => {
                                    const next = new URLSearchParams(params);
                                    next.set("sort", event.target.value);
                                    next.delete("page");
                                    setParams(next);
                                }}>
                                {Object.entries(FEEDBACK_SORTS).map(
                                    ([value, option]) => (
                                        <option key={value} value={value}>
                                            {option.label}
                                        </option>
                                    ),
                                )}
                            </NativeSelect>
                        )}
                    </FormField>
                </div>
            </Card>
            <FeedbackInbox
                key={`${preview ? "preview" : session?.accessToken}:${session?.user.id}:${query.page}:${query.sort}`}
                session={preview ? null : session}
                preview={preview}
                query={query}
                onPageChange={onPageChange}
            />
        </div>
    );
}
