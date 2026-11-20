import { APP_LOCALE, PAGE_PATHS, USER_ROLES } from "@/constants/strings";
import type { UserRole } from "@/types/Auth";

export function formatNotificationDate(created: string) {
    return new Intl.DateTimeFormat(APP_LOCALE, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(created));
}

/** Backend links may only navigate to implemented routes in this account's workspace. */
export function notificationDestination(
    link: string | null,
    basePath: string,
    role: UserRole,
): string | null {
    if (
        !link?.startsWith("/") ||
        link.startsWith("//") ||
        link.includes("\\") ||
        Array.from(link).some((character) => character.charCodeAt(0) < 32)
    )
        return null;
    const url = new URL(link, "https://notification.local");
    let path = url.pathname;
    if (path.startsWith(basePath + "/")) path = path.slice(basePath.length);
    else if (
        path.startsWith("/user/") ||
        path.startsWith("/admin/") ||
        path.startsWith("/preview/")
    )
        return null;
    const allowed: string[] = [
        PAGE_PATHS.home,
        PAGE_PATHS.transactions,
        PAGE_PATHS.portfolio,
        PAGE_PATHS.profile,
        PAGE_PATHS.settings,
        PAGE_PATHS.feedback,
    ];
    allowed.push(PAGE_PATHS.addTransaction);
    if (role === USER_ROLES.admin)
        allowed.push(PAGE_PATHS.members, PAGE_PATHS.bankAccounts);
    const target = path.slice(1);
    if (
        !allowed.includes(target) &&
        !(
            role === USER_ROLES.admin &&
            new RegExp("^" + PAGE_PATHS.members + "/[A-Za-z0-9_-]+$").test(
                target,
            )
        )
    )
        return null;
    return basePath + path + url.search + url.hash;
}
