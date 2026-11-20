import type { NavigationItem } from '@/types/navigation'
import { PAGE_LABELS, PAGE_PATHS } from '@/constants/strings'
import {
    ArrowLeftRight,
    BriefcaseBusiness,
    CircleUserRound,
    House,
    Landmark,
    MessageSquare,
    Settings,
    Users,
} from "lucide-react";

export function getNavigation(admin: boolean): NavigationItem[] {
    return [
        { path: PAGE_PATHS.home, label: PAGE_LABELS.home, icon: House },
        { path: PAGE_PATHS.transactions, label: PAGE_LABELS.transactions, icon: ArrowLeftRight },
        { path: PAGE_PATHS.portfolio, label: PAGE_LABELS.portfolio, icon: BriefcaseBusiness },
        ...(admin ? [{ path: PAGE_PATHS.members, label: PAGE_LABELS.members, icon: Users }] : []),
        ...(admin ? [{ path: PAGE_PATHS.bankAccounts, label: PAGE_LABELS.bankAccounts, icon: Landmark }] : []),
        { path: PAGE_PATHS.profile, label: PAGE_LABELS.profile, icon: CircleUserRound },
        {
            path: PAGE_PATHS.settings,
            label: PAGE_LABELS.settings,
            icon: Settings,
            section: "utility",
        },
        {
            path: PAGE_PATHS.feedback,
            label: PAGE_LABELS.feedback,
            icon: MessageSquare,
            section: "utility",
        },
    ];
}
