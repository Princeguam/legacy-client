import type { THEMES } from '@/constants/strings'
import type { AuthUser, UserRole } from "./Auth";

export type Theme = (typeof THEMES)[keyof typeof THEMES];
export type ProductContextValue = {
    role: UserRole;
    preview: boolean;
    basePath: string;
    user: AuthUser | null;
};
