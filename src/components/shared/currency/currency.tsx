import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import {
    currencyAccessibleName,
    formatCurrency,
} from "@/lib/format-currency";

export function Currency({
    value,
    currency = "NGN",
    locale = "en-NG",
    className,
    ...props
}: ComponentProps<"span"> & {
    value: number;
    currency?: string;
    locale?: string;
}) {
    return (
        <span className={cn("financial", className)} {...props}>
            <span key={`${value}:${currency}:${locale}`} className="currency-value" aria-hidden="true">
                {formatCurrency(value, currency, locale)}
            </span>
            <span className="sr-only">
                {currencyAccessibleName(value, currency, locale)}
            </span>
        </span>
    );
}
