export function formatCurrency(
    value: number,
    currency = "NGN",
    locale = "en-NG",
) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
export function currencyAccessibleName(
    value: number,
    currency = "NGN",
    locale = "en-NG",
) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "name",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
