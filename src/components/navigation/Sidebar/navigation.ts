import {
    ArrowLeftRight,
    BriefcaseBusiness,
    CircleUserRound,
    House,
    MessageSquare,
    Settings,
    Users,
    Wallet,
    type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
    path: string;
    label: string;
    icon: LucideIcon;
    section?: "utility";
};
export function getNavigation(admin: boolean): NavigationItem[] {
    return [
        { path: "home", label: "Home", icon: House },
        { path: "transactions", label: "Transactions", icon: ArrowLeftRight },
        { path: "contributions", label: "Contributions", icon: Wallet },
        { path: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
        ...(admin ? [{ path: "members", label: "Members", icon: Users }] : []),
        { path: "profile", label: "Profile", icon: CircleUserRound },
        {
            path: "settings",
            label: "Settings",
            icon: Settings,
            section: "utility",
        },
        {
            path: "feedback",
            label: "Feedback",
            icon: MessageSquare,
            section: "utility",
        },
    ];
}
