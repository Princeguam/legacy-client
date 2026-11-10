import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, Moon, Plus, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { BrandLogo } from "@/components/shared/brand-logo/brand-logo";
import { Currency } from "@/components/shared/currency/currency";
import { FormField } from "@/components/shared/form-field/form-field";
import { MetricCard } from "@/components/shared/metric-card/metric-card";
import { Alert } from "@/components/shared/ui/alert";
import { Badge } from "@/components/shared/ui/badge";
import { Button, IconButton } from "@/components/shared/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/shared/ui/card";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { Dialog } from "@/components/shared/ui/dialog";
import { Input } from "@/components/shared/ui/input";
import { NativeSelect } from "@/components/shared/ui/native-select";
import { Progress } from "@/components/shared/ui/progress";
import { RadioGroup } from "@/components/shared/ui/radio-group";
import { Switch } from "@/components/shared/ui/switch";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shared/ui/table";
import { Textarea } from "@/components/shared/ui/textarea";
import tokens from "@/design-system/tokens.json";
import manifest from "@/design-system/components.json";
import tokenDownload from "@/design-system/tokens.json?url";
import "./DesignSystem.css";

const initialComponents = new Set([
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "08",
    "09",
    "10",
    "16",
    "17",
    "18",
    "19",
    "21",
    "23",
    "25",
    "29",
]);
const transactions = [
    {
        id: "LWC-001",
        name: "Monthly contribution",
        date: "2026-10-30",
        amount: 500,
    },
    {
        id: "LWC-002",
        name: "Core fund purchase",
        date: "2026-10-28",
        amount: -1200,
    },
    {
        id: "LWC-003",
        name: "Fund distribution",
        date: "2026-10-24",
        amount: 245,
    },
];
function SectionHeading({
    number,
    title,
    children,
}: {
    number: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="section-heading">
            <p className="type-caption">{number} / FOUNDATION</p>
            <h2>{title}</h2>
            <p>{children}</p>
        </div>
    );
}

export function DesignSystemPage() {
    const { theme, toggleTheme } = useTheme();
    const [reviewOpen, setReviewOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState("monthly");
    const [notifications, setNotifications] = useState(false);
    const [notice, setNotice] = useState("");
    const [amount, setAmount] = useState("500.00");
    const [amountError, setAmountError] = useState("");

    return (
        <>
            <a className="skip-link" href="#main">
                Skip to main content
            </a>
            <header className="preview-header">
                <div className="page-container preview-header-inner">
                    <BrandLogo />
                    <div className="preview-header-actions">
                        <span className="type-label preview-header-label">
                            Design system{" "}
                            <span className="type-caption">/ 1.0</span>
                        </span>
                        <IconButton
                            label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                            onClick={toggleTheme}>
                            {theme === "light" ? (
                                <Moon aria-hidden="true" />
                            ) : (
                                <Sun aria-hidden="true" />
                            )}
                        </IconButton>
                    </div>
                </div>
            </header>

            <main
                id="main"
                className="page-container preview-main"
                tabIndex={-1}>
                <section className="preview-hero" aria-labelledby="hero-title">
                    <div className="hero-copy">
                        <div className="hero-eyebrow">
                            <Badge icon={false}>Quiet Distinction</Badge>
                            <span className="type-caption">VERSION 1.0.0</span>
                        </div>
                        <h1 id="hero-title">
                            Quiet distinction.
                            <br />
                            Clear decisions.
                        </h1>
                        <p className="type-lead">
                            A considered foundation for our cooperative. Clear
                            information, precise financial data, and confidence
                            in every interaction.
                        </p>
                        <nav
                            className="preview-jump-links"
                            aria-label="Design system sections">
                            <a href="#foundations">
                                Foundations <ArrowDown aria-hidden="true" />
                            </a>
                            <a href="#components">
                                Components <ArrowDown aria-hidden="true" />
                            </a>
                            <a href="#specifications">
                                Specifications <ArrowDown aria-hidden="true" />
                            </a>
                        </nav>
                    </div>
                    <div className="brand-feature">
                        <span className="type-caption">
                            THE MASTER BRAND COLOUR
                        </span>
                        <p className="financial type-display">#005250</p>
                        <p className="type-title">An enduring identity.</p>
                        <p>
                            Dark teal for trust. A quiet canvas for the
                            decisions that matter.
                        </p>
                        <span className="type-caption brand-feature-footer">
                            LEGACY WEALTH COOPERATIVES
                        </span>
                    </div>
                </section>

                <section
                    id="foundations"
                    className="preview-section"
                    aria-label="Foundations">
                    <SectionHeading number="01" title="An intentional palette.">
                        One brand spectrum. Functional colour only where it
                        carries meaning.
                    </SectionHeading>
                    <div className="palette-grid">
                        {Object.entries(tokens.brand).map(([step, color]) => (
                            <div className="palette-item" key={step}>
                                <div
                                    className="palette-swatch"
                                    style={{
                                        backgroundColor: `var(--lwc-brand-${step})`,
                                    }}
                                    aria-hidden="true"
                                />
                                <div className="palette-label">
                                    <span className="type-label">
                                        {step}
                                        {step === "700" && " · Master"}
                                    </span>
                                    <span className="financial type-caption">
                                        {color}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="foundation-notes">
                        <p>
                            All ordinary text on light surfaces uses{" "}
                            <span className="financial">#001414</span>. Size and
                            weight establish hierarchy.
                        </p>
                        <p>
                            Dark mode rebinds the same semantic roles. The
                            master brand remains{" "}
                            <span className="financial">#005250</span>.
                        </p>
                    </div>
                    <div className="foundation-grid">
                        <Card aria-labelledby="type-title">
                            <CardHeader>
                                <CardTitle id="type-title">
                                    Nine levels. One clear hierarchy.
                                </CardTitle>
                                <CardDescription>
                                    Inter for the interface. IBM Plex Mono
                                    Regular for financial amounts and
                                    identifiers.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="type-specimens">
                                    {Object.entries(tokens.typography).map(
                                        ([name, value]) => (
                                            <div
                                                className="type-specimen"
                                                key={name}>
                                                <span className="type-caption type-name">
                                                    {name}
                                                </span>
                                                <p className={`type-${name}`}>
                                                    {name === "hero"
                                                        ? "A lasting legacy"
                                                        : name === "display"
                                                          ? "Quiet confidence"
                                                          : name === "section"
                                                            ? "Your wealth, considered"
                                                            : "Legacy Wealth"}
                                                </p>
                                                <span className="financial type-caption">
                                                    {value.size}/{value.line} ·{" "}
                                                    {value.weight}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="foundation-stack">
                            <Card aria-labelledby="spacing-title">
                                <CardHeader>
                                    <CardTitle id="spacing-title">
                                        An 8px rhythm.
                                    </CardTitle>
                                    <CardDescription>
                                        Consistent spacing makes room for clear
                                        thinking.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="spacing-scale">
                                        {tokens.space
                                            .filter((space) => space > 0)
                                            .map((space) => (
                                                <div key={space}>
                                                    <span
                                                        className="spacing-bar"
                                                        style={{
                                                            width: `var(--lwc-space-${space})`,
                                                        }}
                                                        aria-hidden="true"
                                                    />
                                                    <span className="financial type-caption">
                                                        {space}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <p className="field-hint">
                                        4px optical spacing only. Cards: 12px
                                        radius and 24px padding. Controls: 8px
                                        radius and 48px height.
                                    </p>
                                </CardFooter>
                            </Card>
                            <Card aria-labelledby="accessibility-title">
                                <CardHeader>
                                    <CardTitle id="accessibility-title">
                                        Clarity includes everyone.
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="principle-list">
                                        <li>
                                            Visible 2px focus with a 2px surface
                                            gap.
                                        </li>
                                        <li>
                                            At least 44px interactive targets.
                                        </li>
                                        <li>
                                            Persistent labels and helpful error
                                            recovery.
                                        </li>
                                        <li>
                                            Status text and symbols alongside
                                            colour.
                                        </li>
                                        <li>
                                            Reduced motion, without hidden
                                            progress.
                                        </li>
                                    </ul>
                                    <p className="field-hint mt-4">
                                        WCAG 2.2 AA is the acceptance target.
                                        Token contrast checks do not certify the
                                        full application.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <section
                    id="components"
                    className="preview-section"
                    aria-label="Components">
                    <SectionHeading
                        number="02"
                        title="Confidence in every interaction.">
                        Shared components, bound to the approved Light and Dark
                        semantic roles.
                    </SectionHeading>
                    <Card aria-labelledby="actions-title">
                        <CardHeader>
                            <CardTitle id="actions-title">
                                Actions, with purpose.
                            </CardTitle>
                            <CardDescription>
                                Hover, press, and use Tab to inspect the focus
                                states. Loading retains the label and blocks
                                repeated activation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="button-examples">
                                <Button onClick={() => setReviewOpen(true)}>
                                    <Plus aria-hidden="true" />
                                    Review contribution
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        setNotice(
                                            "Secondary button activated in this preview.",
                                        )
                                    }>
                                    Secondary action
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() =>
                                        setNotice(
                                            "Danger button activated in this preview. No records were removed.",
                                        )
                                    }>
                                    Danger action
                                </Button>
                                <Button disabled>Unavailable</Button>
                                <Button loading>Review contribution</Button>
                            </div>
                            <div className="button-size-examples">
                                <div>
                                    <span className="type-caption">
                                        COMPACT · 40px / 44px target
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            setNotice(
                                                "Compact button activated.",
                                            )
                                        }>
                                        Compact
                                    </Button>
                                </div>
                                <div>
                                    <span className="type-caption">
                                        DEFAULT · 48px
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setNotice(
                                                "Default button activated.",
                                            )
                                        }>
                                        Default
                                    </Button>
                                </div>
                                <div>
                                    <span className="type-caption">
                                        LARGE · 56px
                                    </span>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() =>
                                            setNotice("Large button activated.")
                                        }>
                                        Large
                                    </Button>
                                </div>
                            </div>
                            <p
                                className="field-hint preview-announcement"
                                role="status">
                                {notice ||
                                    "This is an interactive component preview. No financial actions are submitted."}
                            </p>
                        </CardContent>
                    </Card>
                    <div className="component-grid">
                        <Card aria-labelledby="inputs-title">
                            <CardHeader>
                                <CardTitle id="inputs-title">
                                    Labels that stay. Errors that help.
                                </CardTitle>
                                <CardDescription>
                                    Fields preserve entered values and explain
                                    how to recover.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    className="form-examples"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        const numeric = Number(amount);
                                        const valid =
                                            amount.trim() !== "" &&
                                            Number.isFinite(numeric) &&
                                            numeric > 0;
                                        setAmountError(
                                            valid
                                                ? ""
                                                : "Enter a contribution amount greater than zero.",
                                        );
                                        if (valid) setReviewOpen(true);
                                    }}>
                                    <FormField
                                        label="Contribution amount (GBP)"
                                        hint="Illustrative amount. Enter a number greater than zero."
                                        error={amountError}>
                                        {(bindings) => (
                                            <Input
                                                {...bindings}
                                                className="financial"
                                                inputMode="decimal"
                                                value={amount}
                                                onChange={(event) =>
                                                    setAmount(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        )}
                                    </FormField>
                                    <FormField
                                        label="Email address"
                                        error="Enter a complete email address, such as alex@example.com.">
                                        {(bindings) => (
                                            <Input
                                                {...bindings}
                                                type="email"
                                                defaultValue="alex@"
                                            />
                                        )}
                                    </FormField>
                                    <FormField
                                        label="Member reference"
                                        hint="Read only. You can select and copy this reference.">
                                        {(bindings) => (
                                            <Input
                                                {...bindings}
                                                className="financial"
                                                defaultValue="LWC-2026-001"
                                                readOnly
                                            />
                                        )}
                                    </FormField>
                                    <FormField
                                        label="Account verification"
                                        hint="Editing is unavailable until verification is complete.">
                                        {(bindings) => (
                                            <Input
                                                {...bindings}
                                                placeholder="Awaiting verification"
                                                disabled
                                            />
                                        )}
                                    </FormField>
                                    <Button type="submit" primaryAction>
                                        Preview validation
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card aria-labelledby="choices-title">
                            <CardHeader>
                                <CardTitle id="choices-title">
                                    Familiar choices.
                                </CardTitle>
                                <CardDescription>
                                    Native controls retain browser keyboard and
                                    touch behaviour.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="form-examples">
                                    <FormField label="Reporting period">
                                        {(bindings) => (
                                            <NativeSelect
                                                {...bindings}
                                                defaultValue="2026">
                                                <option value="2026">
                                                    2026 financial year
                                                </option>
                                                <option value="2025">
                                                    2025 financial year
                                                </option>
                                            </NativeSelect>
                                        )}
                                    </FormField>
                                    <RadioGroup
                                        label="Contribution frequency"
                                        name="preview-frequency"
                                        value={selectedPeriod}
                                        onValueChange={setSelectedPeriod}
                                        options={[
                                            {
                                                label: "Monthly",
                                                value: "monthly",
                                            },
                                            {
                                                label: "Annual",
                                                value: "annual",
                                            },
                                        ]}
                                    />
                                    <fieldset className="m-0 min-w-0 border-0 p-0">
                                        <legend className="ui-label mb-2">
                                            Statement preferences
                                        </legend>
                                        <Checkbox
                                            label="Include contribution history"
                                            defaultChecked
                                        />
                                        <Checkbox
                                            label="Some statement items selected"
                                            indeterminate
                                        />
                                        <Checkbox
                                            label="Archived statement (unavailable)"
                                            disabled
                                        />
                                    </fieldset>
                                    <Switch
                                        label="Email notifications"
                                        checked={notifications}
                                        onCheckedChange={setNotifications}
                                    />
                                    <FormField
                                        label="Contribution note"
                                        hint="Optional context. Notes can be resized vertically.">
                                        {(bindings) => (
                                            <Textarea
                                                {...bindings}
                                                placeholder="Add a note…"
                                            />
                                        )}
                                    </FormField>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="status-examples">
                        <Alert tone="success" title="Confirmed">
                            A completed state includes a clear text label.
                        </Alert>
                        <Alert tone="warning" title="Action required">
                            Explain what needs attention and the next step.
                        </Alert>
                        <Alert tone="danger" title="Unable to complete">
                            Preserve entered information and offer recovery.
                        </Alert>
                        <Alert tone="info" title="Good to know">
                            Provide useful context without interrupting.
                        </Alert>
                    </div>
                </section>

                <section
                    id="financial-data"
                    className="preview-section"
                    aria-label="Financial components">
                    <SectionHeading
                        number="03"
                        title="Precise data. Clear context.">
                        Illustrative figures for component review. Currency and
                        locale are configurable.
                    </SectionHeading>
                    <div className="metric-examples">
                        <MetricCard
                            label="Example invested amount"
                            value={12500}
                            period="2026 financial year"
                            note="Illustrative component data."
                        />
                        <MetricCard
                            label="Example zero balance"
                            value={0}
                            period="2026 financial year"
                            note="A confirmed zero is displayed as a value."
                        />
                        <MetricCard
                            label="Example unavailable balance"
                            value={null}
                            period="2026 financial year"
                        />
                        <MetricCard
                            label="Example loading balance"
                            value={null}
                            period="2026 financial year"
                            loading
                        />
                    </div>
                    <Card aria-labelledby="table-title">
                        <CardHeader>
                            <CardTitle id="table-title">
                                Financial records.
                            </CardTitle>
                            <CardDescription>
                                Amounts align right. Identifiers stay visible
                                when the table scrolls.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className="table-region"
                                role="region"
                                aria-label="Illustrative financial records, horizontally scrollable"
                                tabIndex={0}>
                                <Table>
                                    <TableCaption>
                                        Sample records · illustrative financial
                                        data
                                    </TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Transaction</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Amount (GBP)
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>
                                                    <span className="financial type-label">
                                                        {transaction.id}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.name}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <time
                                                        dateTime={
                                                            transaction.date
                                                        }>
                                                        {new Intl.DateTimeFormat(
                                                            "en-GB",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                                timeZone: "UTC",
                                                            },
                                                        ).format(
                                                            new Date(
                                                                `${transaction.date}T00:00:00Z`,
                                                            ),
                                                        )}
                                                    </time>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge tone="success">
                                                        Completed
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="financial">
                                                    <Currency
                                                        value={
                                                            transaction.amount
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="component-grid">
                        <Card aria-labelledby="progress-title">
                            <CardHeader>
                                <CardTitle id="progress-title">
                                    Progress, without invention.
                                </CardTitle>
                                <CardDescription>
                                    Only known progress has a percentage.
                                    Unknown progress retains an explicit label.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="form-examples">
                                <Progress
                                    label="Illustrative annual target"
                                    value={75}
                                />
                                <Progress label="Fetching financial records" />
                            </CardContent>
                        </Card>
                        <Card aria-labelledby="dialog-title">
                            <CardHeader>
                                <CardTitle id="dialog-title">
                                    Room for a considered decision.
                                </CardTitle>
                                <CardDescription>
                                    Review amount, source, destination, and fees
                                    before a consequential action.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    The modal keeps focus inside the review,
                                    makes the background inert, and returns
                                    focus when closed.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => setReviewOpen(true)}>
                                    Open review preview{" "}
                                    <ArrowUpRight aria-hidden="true" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

                <section
                    id="specifications"
                    className="preview-section"
                    aria-label="Component specifications">
                    <SectionHeading
                        number="04"
                        title="A foundation that can grow.">
                        The complete set of supplied specifications guides each
                        future component and page.
                    </SectionHeading>
                    <div className="specification-grid">
                        {manifest.components.map((component) => (
                            <div
                                className="specification-item"
                                key={component.id}>
                                <span className="financial type-caption">
                                    {component.id}
                                </span>
                                <div>
                                    <p className="type-label">
                                        {component.name}
                                    </p>
                                    <p className="type-caption">
                                        {initialComponents.has(component.id)
                                            ? "Available in this foundation"
                                            : "Specified for a future batch"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="preview-download">
                        <p>
                            Portable tokens, generated CSS, and all 30
                            specifications share the same approved source.
                        </p>
                        <a
                            href={tokenDownload}
                            download="legacy-wealth-tokens.json">
                            Download design tokens{" "}
                            <ArrowDown aria-hidden="true" />
                        </a>
                    </div>
                </section>
            </main>
            <footer className="page-container preview-footer">
                <span className="type-caption">
                    LEGACY WEALTH COOPERATIVES / QUIET DISTINCTION
                </span>
                <span className="type-caption">
                    Design system 1.0.0 · Foundation preview
                </span>
            </footer>
            <Dialog
                open={reviewOpen}
                onOpenChange={setReviewOpen}
                title="Review contribution"
                description="Illustrative review. No payment or contribution will be submitted."
                footer={
                    <Button onClick={() => setReviewOpen(false)}>
                        Close preview
                    </Button>
                }>
                <dl className="review-details">
                    <div>
                        <dt>Amount</dt>
                        <dd>
                            <Currency
                                value={
                                    Number.isFinite(Number(amount)) &&
                                    Number(amount) > 0
                                        ? Number(amount)
                                        : 500
                                }
                            />
                        </dd>
                    </div>
                    <div>
                        <dt>Source</dt>
                        <dd>Example member account</dd>
                    </div>
                    <div>
                        <dt>Destination</dt>
                        <dd>Example cooperative contribution fund</dd>
                    </div>
                    <div>
                        <dt>Fee</dt>
                        <dd>
                            <Currency value={0} />
                        </dd>
                    </div>
                </dl>
            </Dialog>
        </>
    );
}
