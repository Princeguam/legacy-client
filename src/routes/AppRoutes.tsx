import type { ScreenRoute } from "@/types/routing";
import { PAGE_PATHS, ROUTES, USER_ROLES } from "@/constants/strings";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { PageLoader } from "@/components/shared/page-loader/PageLoader";
import { Login } from "@/pages/auth/Login";
import { useAuth } from "@/context/useAuth";
import { isValidSession } from "@/services/authService";
import { roleHome } from "@/lib/role-home";
import { ProtectedRoute } from "./ProtectedRoute";
import { UserLayout } from "@/layouts/UserLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

const DesignSystem = lazy(() =>
    import("@/pages/DesignSystem").then((module) => ({
        default: module.DesignSystemPage,
    })),
);
const Preview = lazy(() =>
    import("@/pages/Preview").then((module) => ({ default: module.Preview })),
);
const UnderConstruction = lazy(() =>
    import("@/pages/progress/UnderConstruction").then((module) => ({
        default: module.UnderConstruction,
    })),
);
const userPages: ScreenRoute[] = [
    {
        path: PAGE_PATHS.addTransaction,
        Page: lazy(() =>
            import("@/pages/user/AddTransaction").then((module) => ({
                default: module.AddTransaction,
            })),
        ),
    },
    {
        path: PAGE_PATHS.home,
        Page: lazy(() =>
            import("@/pages/user/Dashboard").then((module) => ({
                default: module.Dashboard,
            })),
        ),
    },
    {
        path: PAGE_PATHS.profile,
        Page: lazy(() =>
            import("@/pages/user/Profile").then((module) => ({
                default: module.Profile,
            })),
        ),
    },
    {
        path: PAGE_PATHS.settings,
        Page: lazy(() =>
            import("@/pages/user/Settings").then((module) => ({
                default: module.Settings,
            })),
        ),
    },
    {
        path: PAGE_PATHS.feedback,
        Page: lazy(() =>
            import("@/pages/user/Feedback").then((module) => ({
                default: module.Feedback,
            })),
        ),
    },
    {
        path: PAGE_PATHS.transactions,
        Page: lazy(() =>
            import("@/pages/user/Transactions").then((module) => ({
                default: module.Transactions,
            })),
        ),
    },
    {
        path: PAGE_PATHS.portfolio,
        Page: lazy(() =>
            import("@/pages/user/Portfolio").then((module) => ({
                default: module.Portfolio,
            })),
        ),
    },
];
const adminPages: ScreenRoute[] = [
    {
        path: PAGE_PATHS.addTransaction,
        Page: lazy(() => import('@/pages/admin/AddTransaction').then(module => ({ default: module.AddTransaction }))),
    },
    {
        path: PAGE_PATHS.bankAccounts,
        Page: lazy(() => import('@/pages/admin/BankAccounts').then(module => ({ default: module.BankAccounts }))),
    },
    {
        path: PAGE_PATHS.newFeedback,
        Page: lazy(() => import("@/pages/admin/CreateFeedback").then(module => ({ default: module.CreateFeedback }))),
    },
    {
        path: PAGE_PATHS.home,
        Page: lazy(() =>
            import("@/pages/admin/Dashboard").then((module) => ({
                default: module.Dashboard,
            })),
        ),
    },
    {
        path: PAGE_PATHS.profile,
        Page: lazy(() =>
            import("@/pages/admin/Profile").then((module) => ({
                default: module.Profile,
            })),
        ),
    },
    {
        path: PAGE_PATHS.settings,
        Page: lazy(() =>
            import("@/pages/admin/Settings").then((module) => ({
                default: module.Settings,
            })),
        ),
    },
    {
        path: PAGE_PATHS.feedback,
        Page: lazy(() =>
            import("@/pages/admin/Feedback").then((module) => ({
                default: module.Feedback,
            })),
        ),
    },
    {
        path: PAGE_PATHS.members,
        Page: lazy(() =>
            import("@/pages/admin/ManageUsers").then((module) => ({
                default: module.ManageUsers,
            })),
        ),
    },
    {
        path: PAGE_PATHS.memberDetails,
        Page: lazy(() =>
            import("@/pages/admin/MemberDetails").then((module) => ({
                default: module.MemberDetails,
            })),
        ),
    },
    {
        path: PAGE_PATHS.transactions,
        Page: lazy(() =>
            import("@/pages/admin/Transactions").then((module) => ({
                default: module.Transactions,
            })),
        ),
    },
    {
        path: PAGE_PATHS.portfolio,
        Page: lazy(() =>
            import("@/pages/admin/Portfolio").then((module) => ({
                default: module.Portfolio,
            })),
        ),
    },
];
function ContributionsRedirect() {
    const { search, hash } = useLocation();
    const params = new URLSearchParams(search);
    params.delete("type");
    return <Navigate to={{ pathname: `../${PAGE_PATHS.transactions}`, search: `?${params}`, hash }} replace />;
}

function screenRoutes(pages: ScreenRoute[]) {
    return (
        <>
            <Route index element={<Navigate to={PAGE_PATHS.home} replace />} />
            {pages.map(({ path, Page }) => (
                <Route key={path} path={path} element={<Page />} />
            ))}
            <Route path={PAGE_PATHS.contributions} element={<ContributionsRedirect />} />
            <Route
                path={PAGE_PATHS.legacyDashboard}
                element={<Navigate to={`../${PAGE_PATHS.home}`} replace />}
            />
            <Route
                path="*"
                element={<Navigate to={`../${PAGE_PATHS.home}`} replace />}
            />
        </>
    );
}
export function AppRoutes() {
    const { session } = useAuth();
    const home = isValidSession(session)
        ? roleHome(session.user.role)
        : ROUTES.login;
    return (
        <Suspense fallback={<PageLoader fullPage />}>
            <Routes>
                <Route
                    path={ROUTES.root}
                    element={<Navigate to={home} replace />}
                />
                <Route
                    path={ROUTES.login}
                    element={
                        isValidSession(session) ? (
                            <Navigate to={home} replace />
                        ) : (
                            <Login />
                        )
                    }
                />
                <Route path={ROUTES.designSystem} element={<DesignSystem />} />
                <Route path={ROUTES.preview} element={<Preview />} />
                <Route
                    path={ROUTES.underConstruction}
                    element={
                        <main>
                            <UnderConstruction fullPage />
                        </main>
                    }
                />
                <Route
                    path={ROUTES.previewUser}
                    element={<UserLayout preview />}>
                    {screenRoutes(userPages)}
                </Route>
                <Route
                    path={ROUTES.previewAdmin}
                    element={<AdminLayout preview />}>
                    {screenRoutes(adminPages)}
                </Route>
                <Route element={<ProtectedRoute roles={[USER_ROLES.user]} />}>
                    <Route path={ROUTES.user} element={<UserLayout />}>
                        {screenRoutes(userPages)}
                    </Route>
                </Route>
                <Route element={<ProtectedRoute roles={[USER_ROLES.admin]} />}>
                    <Route path={ROUTES.admin} element={<AdminLayout />}>
                        {screenRoutes(adminPages)}
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to={home} replace />} />
            </Routes>
        </Suspense>
    );
}
