import type { UserRole } from "@/types/Auth";
import { ROUTES, USER_ROLES } from "@/constants/strings";
export function roleHome(role: UserRole) {
    return role === USER_ROLES.admin ? ROUTES.adminHome : ROUTES.userHome;
}

export function workspacePath(role: UserRole, preview = false) {
    if (preview)
        return role === USER_ROLES.admin
            ? ROUTES.previewAdmin
            : ROUTES.previewUser;
    return role === USER_ROLES.admin ? ROUTES.admin : ROUTES.user;
}
