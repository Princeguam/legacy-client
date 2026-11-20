import { notify } from "@/lib/notify";
import type { LoginErrors } from "@/types/Auth";
import { AUTH_MESSAGES, ROUTES } from "@/constants/strings";
import { useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, IconButton } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { FormField } from "@/components/shared/form-field/form-field";
import { Input } from "@/components/shared/ui/input";
import { useAuth } from "@/context/useAuth";
import { AuthLayout } from "@/layouts/AuthLayout";
import { validateLogin } from "./loginValidation";
import "./Login.css";

export function Login() {
    const { isSigningIn, signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>({});
    const [help, setHelp] = useState<"password" | "access" | null>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSigningIn) return;
        const nextErrors = validateLogin({ email, password });
        setErrors(nextErrors);
        if (nextErrors.email || nextErrors.password) {
            if (nextErrors.email) emailRef.current?.focus();
            else passwordRef.current?.focus();
            return;
        }
        try {
            await signIn({ email, password });
            setPassword("");
            setShowPassword(false);
        } catch (error) {
            notify.error(error, AUTH_MESSAGES.failed);
        }
    }

    return (
        <AuthLayout>
            <div className="login-content">
                <>
                    <div className="login-heading">
                        <h1 className="type-heading">Welcome back</h1>
                        <p>Welcome back! Please enter your details to login</p>
                    </div>
                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                        noValidate
                        aria-busy={isSigningIn || undefined}>
                        <FormField
                            id="login-email"
                            label="Email"
                            error={errors.email}>
                            {(bindings) => (
                                <Input
                                    {...bindings}
                                    ref={emailRef}
                                    type="email"
                                    name="email"
                                    autoComplete="username"
                                    placeholder="Enter your email"
                                    value={email}
                                    readOnly={isSigningIn}
                                    required
                                    spellCheck={false}
                                    autoCapitalize="none"
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        if (errors.email)
                                            setErrors((current) => ({
                                                ...current,
                                                email: undefined,
                                            }));
                                    }}
                                />
                            )}
                        </FormField>
                        <FormField
                            id="login-password"
                            label="Password"
                            error={errors.password}>
                            {(bindings) => (
                                <div className="login-password-control">
                                    <Input
                                        {...bindings}
                                        ref={passwordRef}
                                        className="login-password-input"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        name="password"
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={password}
                                        readOnly={isSigningIn}
                                        required
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            if (errors.password)
                                                setErrors((current) => ({
                                                    ...current,
                                                    password: undefined,
                                                }));
                                        }}
                                    />
                                    <IconButton
                                        label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="login-password-toggle"
                                        disabled={isSigningIn}
                                        aria-controls="login-password"
                                        aria-pressed={showPassword}
                                        onClick={() =>
                                            setShowPassword(
                                                (current) => !current,
                                            )
                                        }>
                                        {showPassword ? (
                                            <EyeOff aria-hidden="true" />
                                        ) : (
                                            <Eye aria-hidden="true" />
                                        )}
                                    </IconButton>
                                </div>
                            )}
                        </FormField>
                        <div className="login-options">
                            <button
                                className="auth-text-action"
                                type="button"
                                onClick={() => setHelp("password")}>
                                Forgot password?
                            </button>
                        </div>
                        <Button
                            type="submit"
                            className="login-submit"
                            loading={isSigningIn}
                            primaryAction>
                            Sign in
                        </Button>
                        {isSigningIn && (
                            <p className="field-hint" role="status">
                                Signing in. Please wait.
                            </p>
                        )}
                    </form>
                    <p className="login-access">
                        Don’t have an account?{" "}
                        <button
                            className="auth-text-action"
                            type="button"
                            onClick={() => setHelp("access")}>
                            Request access
                        </button>
                    </p>
                </>
                <p className="login-preview-link type-label">
                    <Link className="auth-text-action" to={ROUTES.preview}>
                        Explore illustrative page previews
                    </Link>
                </p>
            </div>
            <Modal
                open={help !== null}
                onOpenChange={(open) => {
                    if (!open) setHelp(null);
                }}
                title={
                    help === "password"
                        ? "Reset your password"
                        : "Request account access"
                }
                description={
                    help === "password"
                        ? "Password self-service reset will be available soon. We’re working on making it easier for you to securely reset your password directly from this platform."
                        : "Your cooperative administrator can set up your membership account."
                }>
                <p>
                    {help === "password"
                        ? "In the meantime, please contact your cooperative administrator through your cooperative’s usual support channel for assistance with resetting your password."
                        : "Contact your administrator through your cooperative’s usual support channel to request access and receive your sign-in details."}
                </p>
            </Modal>
        </AuthLayout>
    );
}
