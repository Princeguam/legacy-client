import { COMMON_LABELS, ROUTES, THEMES } from "@/constants/strings";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Wallet } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo/brand-logo";
import { Card } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import "@/layouts/ProductLayout.css";

export function Preview() {
    return (
        <main className="preview-landing" data-theme={THEMES.light}>
            <div className="preview-landing-inner">
                <BrandLogo />
                <div className="page-stack">
                    <div>
                        <Badge icon={false}>Product page preview</Badge>
                        <h1 className="type-display">
                            Your cooperative, considered.
                        </h1>
                    </div>
                    <p>
                        Explore the member and administrator workspaces with
                        layout previews without account or seeded financial data.
                    </p>
                    <p className="type-label">
                        These previews do not create a session or grant account
                        access.
                    </p>
                </div>
                <div className="preview-options">
                    <Card className="product-card">
                        <span className="holding-icon">
                            <Wallet size={24} aria-hidden="true" />
                        </span>
                        <h2 className="type-heading">Member workspace</h2>
                        <p>
                            A personal view of contributions, transactions,
                            portfolio, and annual progress.
                        </p>
                        <Link className="action-link" to="/preview/user/home">
                            Explore member pages
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </Card>
                    <Card className="product-card">
                        <span className="holding-icon">
                            <Users size={24} aria-hidden="true" />
                        </span>
                        <h2 className="type-heading">
                            Administrator workspace
                        </h2>
                        <p>
                            Cooperative totals, spending, member records, and
                            planning settings.
                        </p>
                        <Link className="action-link" to="/preview/admin/home">
                            Explore admin pages
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </Card>
                </div>
                <div className="inline-actions">
                    <Link className="standalone-link" to={ROUTES.login}>
                        {COMMON_LABELS.backToSignIn}
                    </Link>
                    <Link className="standalone-link" to={ROUTES.designSystem}>
                        View design system
                    </Link>
                </div>
            </div>
        </main>
    );
}
