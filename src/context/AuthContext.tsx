import { MAX_TIMER_DELAY_MS } from "@/constants/values";
import type { AuthContextValue } from "@/types/Auth";
import { AUTH_MESSAGES, STORAGE_KEYS } from "@/constants/strings";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { login, AuthError } from "@/services/authService";
import {
    clearSession,
    mergeSessionUser,
    persistSession,
    restoreSession,
} from "@/services/authSession";
import { authContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState(restoreSession);
    const sessionRef = useRef(session);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const submitting = useRef(false);
    const signOut = useCallback(() => {
        clearSession();
        sessionRef.current = null;
        setSession(null);
    }, []);
    const updateUser: AuthContextValue["updateUser"] = useCallback(
        (user, accessToken) => {
            const nextSession = mergeSessionUser(
                sessionRef.current,
                user,
                accessToken,
            );
            if (!nextSession) return false;
            persistSession(nextSession);
            sessionRef.current = nextSession;
            setSession(nextSession);
            return true;
        },
        [],
    );
    const signIn: AuthContextValue["signIn"] = useCallback(
        async (credentials) => {
            if (submitting.current)
                throw new AuthError(AUTH_MESSAGES.duplicate);
            submitting.current = true;
            setIsSigningIn(true);
            try {
                const nextSession = await login(credentials);
                persistSession(nextSession);
                sessionRef.current = nextSession;
                setSession(nextSession);
            } finally {
                submitting.current = false;
                setIsSigningIn(false);
            }
        },
        [],
    );

    useEffect(() => {
        const synchronizeSession = (event: StorageEvent) => {
            if (event.key === STORAGE_KEYS.session || event.key === null) {
                const nextSession = restoreSession();
                sessionRef.current = nextSession;
                setSession(nextSession);
            }
        };
        window.addEventListener("storage", synchronizeSession);
        return () => window.removeEventListener("storage", synchronizeSession);
    }, []);

    useEffect(() => {
        if (!session) return;
        const timeout = setTimeout(
            signOut,
            Math.min(
                Math.max(session.expiresAt - Date.now(), 0),
                MAX_TIMER_DELAY_MS,
            ),
        );
        const checkExpiry = () => {
            if (session.expiresAt <= Date.now()) signOut();
        };
        document.addEventListener("visibilitychange", checkExpiry);
        return () => {
            clearTimeout(timeout);
            document.removeEventListener("visibilitychange", checkExpiry);
        };
    }, [session, signOut]);

    return (
        <authContext.Provider
            value={{ session, isSigningIn, signIn, signOut, updateUser }}>
            {children}
        </authContext.Provider>
    );
}
