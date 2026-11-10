import { useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, IconButton } from "@/components/shared/Button";
import { Modal } from "@/components/shared/Modal";
import { FormField } from "@/components/shared/form-field/form-field";
import { Input } from "@/components/shared/ui/input";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { Alert } from "@/components/shared/ui/alert";
import { useAuth } from "@/context/useAuth";
import { AuthError } from "@/services/authService";
import { AuthLayout } from "@/layouts/AuthLayout";
import { validateLogin, type LoginErrors } from "./loginValidation";
import "./Login.css";

export function Login() {
    const { isSigningIn, signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>({});
    const [requestError, setRequestError] = useState("");
    const [help, setHelp] = useState<"password" | "access" | null>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const errorRef = useRef<HTMLDivElement>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSigningIn) return;
        const nextErrors = validateLogin({ email, password });
        setErrors(nextErrors);
        setRequestError("");
        if (nextErrors.email || nextErrors.password) {
            if (nextErrors.email) emailRef.current?.focus();
            else passwordRef.current?.focus();
            return;
        }
        try {
            await signIn({ email, password }, remember);
            setPassword("");
            setShowPassword(false);
        } catch (error) {
            setRequestError(
                error instanceof AuthError
                    ? error.message
                    : "Unable to sign in. Please try again.",
            );
            requestAnimationFrame(() => errorRef.current?.focus());
        }
    }

    return (
        <AuthLayout>
            <div className="login-content">
                    <>
                        <div className="login-heading">
                            <h1 className="type-heading">Welcome back</h1>
                            <p>Welcome back! Please enter your details.</p>
                        </div>
                        <form
                            className="login-form"
                            onSubmit={handleSubmit}
                            noValidate
                            aria-busy={isSigningIn || undefined}>
                            {requestError && (
                                <Alert
                                    ref={errorRef}
                                    tabIndex={-1}
                                    tone="danger"
                                    title="Unable to sign in"
                                    role="alert">
                                    <p>{requestError}</p>
                                </Alert>
                            )}
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
                                                showPassword
                                                    ? "text"
                                                    : "password"
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
                                <Checkbox
                                    label="Remember me"
                                    name="remember"
                                    checked={remember}
                                    disabled={isSigningIn}
                                    onChange={(event) =>
                                        setRemember(event.target.checked)
                                    }
                                />
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
                <p className="login-preview-link type-label"><Link className="auth-text-action" to="/preview">Explore illustrative page previews</Link></p>
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
                        ? "Your cooperative administrator can help you reset your password."
                        : "Your cooperative administrator can set up your membership account."
                }>
                <p>
                    {help === "password"
                        ? "Contact your administrator through your cooperative’s usual support channel. Once your password has been reset, return here to sign in."
                        : "Contact your administrator through your cooperative’s usual support channel to request access and receive your sign-in details."}
                </p>
            </Modal>
        </AuthLayout>
    );
}
