import { MONEY_DECIMAL_PLACES } from '@/constants/values'
import { APP_CURRENCY, APP_LOCALE } from '@/constants/strings'
export function formatCurrency(
    value: number,
    currency = APP_CURRENCY,
    locale = APP_LOCALE,
) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: MONEY_DECIMAL_PLACES,
        maximumFractionDigits: MONEY_DECIMAL_PLACES,
    }).format(value);
}
export function currencyAccessibleName(
    value: number,
    currency = APP_CURRENCY,
    locale = APP_LOCALE,
) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "name",
        minimumFractionDigits: MONEY_DECIMAL_PLACES,
        maximumFractionDigits: MONEY_DECIMAL_PLACES,
    }).format(value);
}
