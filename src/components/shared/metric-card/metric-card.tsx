import { Card } from "../ui/card";
import { Currency } from "../currency/currency";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

export function MetricCard({
    label,
    value,
    currency = "NGN",
    locale = "en-NG",
    period,
    note,
    loading = false,
    error,
    onRetry,
}: {
    label: string;
    value: number | null;
    currency?: string;
    locale?: string;
    period: string;
    note?: string;
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
}) {
    return (
        <Card className="metric-card card-watermark" aria-busy={loading || undefined}>
            <dl>
                <dt>{label}</dt>
                <dd className="metric-value">
                    {loading ? (
                        <>
                            <Skeleton className="h-10 w-full max-w-48" />
                            <span className="sr-only">
                                Loading balance in {currency}
                            </span>
                        </>
                    ) : error ? (
                        <span className="type-body field-error">{error}</span>
                    ) : value === null ? (
                        <>
                            <span aria-hidden="true">—</span>
                            <span className="sr-only">Balance unavailable</span>
                        </>
                    ) : (
                        <Currency
                            value={value}
                            currency={currency}
                            locale={locale}
                        />
                    )}
                </dd>
            </dl>
            <p className="field-hint mt-2">{period}</p>
            {note && <p className="field-hint mt-2">{note}</p>}
            {value === null && !loading && !error && (
                <p className="field-hint mt-2">
                    No balance data available yet.
                </p>
            )}
            {error && onRetry && (
                <Button variant="outline" onClick={onRetry} className="mt-4">
                    Retry
                </Button>
            )}
        </Card>
    );
}
