import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { Card } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Currency } from "@/components/shared/currency/currency";
import { MetricCard } from "@/components/shared/metric-card/metric-card";
import { Progress } from "@/components/shared/ui/progress";
import { PageHeader } from "@/components/shared/product/PageHeader";
import { ContributionChart } from "@/components/shared/product/ContributionChart";
import { TransactionList } from "@/components/shared/product/TransactionList";
import { Allocation } from "@/components/shared/product/Allocation";
import { useProduct } from "@/components/shared/product/product-context";
import {
    cooperativeHoldings,
    getSummary,
    getTransactions,
    members,
} from "@/lib/product-data";

export function Dashboard() {
    const { basePath } = useProduct();
    const summary = getSummary("Admin"),
        rows = getTransactions("Admin");
    const active = members.filter(
        (member) => member.status === "Active",
    ).length;
    const pending = rows.filter((row) => row.status === "Pending");
    return (
        <div className="page-stack">
            <PageHeader
                title="Cooperative overview"
                description="The bigger picture: member contributions, investments, and spending."
                actions={
                    <Link to={`${basePath}/members`} className="action-link">
                        <Users aria-hidden="true" />
                        View members
                    </Link>
                }
            />
            <div className="dashboard-columns">
                <Card className="product-card wealth-card">
                    <div className="card-heading">
                        <p className="type-label">Cooperative total balance</p>
                        <Badge icon={false}>Illustrative</Badge>
                    </div>
                    <Currency className="wealth-value" value={summary.wealth} />
                    <p className="type-label">
                        Contributions less spending · as of 10 November 2026
                    </p>
                    <dl className="wealth-breakdown">
                        <div>
                            <dt className="type-label">Invested</dt>
                            <dd>
                                <Currency value={summary.invested} />
                            </dd>
                        </div>
                        <div>
                            <dt className="type-label">Available cash</dt>
                            <dd>
                                <Currency value={summary.cash} />
                            </dd>
                        </div>
                    </dl>
                </Card>
                <Card className="product-card card-watermark">
                    <h2 className="type-title">Membership at a glance</h2>
                    <span className="summary-number">{members.length}</span>
                    <p className="type-label">Illustrative member records</p>
                    <dl className="detail-list">
                        <div>
                            <dt>Active members</dt>
                            <dd>{active}</dd>
                        </div>
                        <div>
                            <dt>Pending membership</dt>
                            <dd>
                                <Badge tone="warning">
                                    {members.length - active} pending
                                </Badge>
                            </dd>
                        </div>
                    </dl>
                    <Link
                        to={`${basePath}/members`}
                        className="standalone-link type-label">
                        Open member directory
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </Card>
            </div>
            <div className="metrics-grid metrics-grid-four">
                <MetricCard
                    label="Total contributions"
                    value={summary.contributed}
                    period="January–October 2026"
                />
                <MetricCard
                    label="Total invested"
                    value={summary.invested}
                    period="Across three cooperative funds"
                />
                <MetricCard
                    label="Confirmed spending"
                    value={summary.expenses}
                    period="2026 operating expenses"
                />
                <MetricCard
                    label="Annual contribution gap"
                    value={summary.remaining}
                    period="Against active members’ annual commitments"
                />
            </div>
            <ContributionChart />
            <div className="dashboard-columns">
                <Card className="product-card">
                    <div className="card-heading">
                        <h2 className="type-title">Cooperative activity</h2>
                        <Link
                            to={`${basePath}/transactions`}
                            className="standalone-link type-label">
                            View all
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                    <TransactionList rows={rows.slice(0, 5)} admin compact />
                </Card>
                <Card className="product-card">
                    <h2 className="type-title">Pending items</h2>
                    <p className="type-label">
                        Illustrative records to review. No approvals are
                        submitted from this preview.
                    </p>
                    <ul className="review-list">
                        <li>
                            <div>
                                <span>
                                    {
                                        pending.filter(
                                            (row) =>
                                                row.type === "Contribution",
                                        ).length
                                    }{" "}
                                    contributions
                                </span>
                                <Currency
                                    value={pending
                                        .filter(
                                            (row) =>
                                                row.type === "Contribution",
                                        )
                                        .reduce(
                                            (sum, row) => sum + row.amount,
                                            0,
                                        )}
                                />
                            </div>
                            <Link
                                to={`${basePath}/transactions?status=Pending&type=Contribution`}
                                className="standalone-link type-label">
                                View
                            </Link>
                        </li>
                        <li>
                            <div>
                                <span>Annual audit provision</span>
                                <Currency value={90_000} />
                            </div>
                            <Link
                                to={`${basePath}/transactions?status=Pending&type=Expense`}
                                className="standalone-link type-label">
                                View
                            </Link>
                        </li>
                        <li>
                            <span>
                                {members.length - active} membership requests
                            </span>
                            <Link
                                to={`${basePath}/members?status=Pending`}
                                className="standalone-link type-label">
                                View
                            </Link>
                        </li>
                    </ul>
                </Card>
            </div>
            <div className="dashboard-columns-even dashboard-columns">
                <Card className="product-card">
                    <h2 className="type-title">Investment allocation</h2>
                    <Allocation holdings={cooperativeHoldings} />
                    <Link
                        to={`${basePath}/portfolio`}
                        className="standalone-link type-label">
                        View cooperative portfolio
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </Card>
                <Card className="product-card card-watermark">
                    <h2 className="type-title">The annual commitment</h2>
                    <p>
                        <Currency value={summary.contributed} /> of{" "}
                        <Currency value={summary.target} /> contributed.
                    </p>
                    <Progress
                        label="2026 cooperative contribution progress"
                        value={summary.contributed}
                        max={summary.target}
                    />
                    <p className="type-label">
                        Annual commitments include {active} active members.
                        Pending contributions are excluded.
                    </p>
                    <Link
                        to={`${basePath}/contributions`}
                        className="standalone-link type-label">
                        View contributions
                        <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </Card>
            </div>
        </div>
    );
}
