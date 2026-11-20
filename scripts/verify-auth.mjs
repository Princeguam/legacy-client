import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
});
const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
try {
    const { login, parseLoginResponse, isValidSession, AuthError } =
        await server.ssrLoadModule("/src/services/authService.ts");
    const { validateLogin } = await server.ssrLoadModule(
        "/src/pages/auth/loginValidation.ts",
    );
    const fixture = {
        success: true,
        message: "Request Successful",
        data: {
            id: 1,
            email: "member@example.com",
            firstName: "Alex",
            middleName: null,
            lastName: "Member",
            phoneNo: "+234 800 000 0000",
            dob: "1995-01-01T00:00:00.000Z",
            address: "Illustrative address",
            state: null,
            lga: null,
            gender: null,
            passport: null,
            isAdmin: false,
            isDeleted: false,
            created: "2026-11-01T00:00:00.000Z",
            updated: "2026-11-01T00:00:00.000Z",
            role: "User",
            accessToken: "test-token",
            refreshToken: "test-refresh-token",
            expiresAt: Date.now() + 60000,
        },
    };

    const { isApiResponse } = await server.ssrLoadModule("/src/services/apiResponse.ts");
    assert.ok(isApiResponse(fixture));
    assert.ok(isApiResponse({ ...fixture, errorCode: undefined }));
    assert.ok(isApiResponse({ success: true, message: "Done", data: null }));
    assert.ok(isApiResponse({ success: false, message: "Incorrect Password", errorCode: 1010 }));
    for (const value of [null, {}, { ...fixture, message: undefined }, { ...fixture, errorCode: 1010 }, { success: true, message: "Done" }, { success: false, message: "Failed" }, { success: false, message: "Failed", errorCode: "1010" }, { success: false, message: "Failed", data: null, errorCode: 1010 }]) {
        assert.equal(isApiResponse(value), false);
    }
    assert.throws(() => parseLoginResponse({ success: true, message: "Done", data: null }), AuthError);
    assert.throws(() => parseLoginResponse({ success: false, message: "Incorrect Password", errorCode: 1010 }), error => error instanceof AuthError && error.errorCode === 1010 && error.message === "Incorrect Password");
    const sanitized = parseLoginResponse({ ...fixture, data: { ...fixture.data, password: "unexpected-secret" } });
    assert.ok(!JSON.stringify(sanitized).includes("unexpected-secret"));
    assert.equal(parseLoginResponse(fixture).user.role, "user");
    assert.equal(
        parseLoginResponse({
            ...fixture,
            data: { ...fixture.data, role: "Admin" },
        }).user.role,
        "Admin",
    );
    assert.equal(
        parseLoginResponse({
            ...fixture,
            data: { ...fixture.data, isAdmin: true },
        }).user.role,
        "user",
    );
    for (const data of [
        { ...fixture.data, role: "owner" },
        { ...fixture.data, expiresAt: Date.now() - 1 },
        { ...fixture.data, accessToken: "" },
        { ...fixture.data, accessToken: "   " },
        { ...fixture.data, refreshToken: "" },
        { ...fixture.data, id: "member-1" },
        { ...fixture.data, middleName: 42 },
        { ...fixture.data, phoneNo: undefined },
        { ...fixture.data, email: "  " },
        { ...fixture.data, isDeleted: true },
    ])
        assert.throws(
            () => parseLoginResponse({ ...fixture, data }),
            AuthError,
        );
    assert.ok(validateLogin({ email: "", password: "" }).email);
    assert.ok(validateLogin({ email: "", password: "" }).password);
    assert.ok(validateLogin({ email: "wrong", password: "value" }).email);
    assert.deepEqual(
        validateLogin({
            email: " member@example.com ",
            password: " password ",
        }),
        {},
    );

    let request;
    globalThis.fetch = async (url, options) => {
        request = { url, options };
        return new Response(JSON.stringify(fixture), { status: 200 });
    };
    const session = await login({
        email: " member@example.com ",
        password: " password ",
    });
    assert.ok(isValidSession(session));
    assert.ok(request.url.endsWith("/auth/login"));
    assert.equal(request.options.method, "POST");
    assert.deepEqual(JSON.parse(request.options.body), {
        email: "member@example.com",
        password: " password ",
    });
    for (const [status, message] of [
        [401, "Check your credentials."],
        [429, "Too many sign-in attempts."],
    ]) {
        globalThis.fetch = async () =>
            new Response(JSON.stringify({ success: false, message, errorCode: 1010 }), {
                status,
            });
        await assert.rejects(
            login({ email: "member@example.com", password: "value" }),
            error => error instanceof AuthError && error.message === message && error.errorCode === 1010 && error.status === status,
        );
    }
    globalThis.fetch = async () => {
        throw new TypeError("Network unavailable");
    };
    await assert.rejects(
        login({ email: "member@example.com", password: "value" }),
        /Unable to connect/,
    );
    globalThis.fetch = async () =>
        new Response("<html>Service unavailable</html>", { status: 502 });
    await assert.rejects(
        login({ email: "member@example.com", password: "value" }),
        /service is unavailable/,
    );

    globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: "Backend unavailable", errorCode: 1000 }), { status: 503 });
    await assert.rejects(login({ email: "member@example.com", password: "value" }), error => error.errorCode === 1000 && error.status === 503 && error.message === "Backend unavailable");
    globalThis.fetch = async () => new Response(JSON.stringify(fixture), { status: 401 });
    await assert.rejects(login({ email: "member@example.com", password: "value" }), AuthError);
    globalThis.fetch = async () => new Response(JSON.stringify({ ...fixture, message: undefined }), { status: 200 });
    await assert.rejects(login({ email: "member@example.com", password: "value" }), AuthError);
    const originalSetTimeout = globalThis.setTimeout;
    let timeoutDelay;
    try {
        globalThis.setTimeout = (callback, delay) => { timeoutDelay = delay; queueMicrotask(callback); return 0; };
        globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
            signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
        });
        await assert.rejects(login({ email: "member@example.com", password: "value" }), /timed out/);
        assert.equal(timeoutDelay, 20000);
    } finally { globalThis.setTimeout = originalSetTimeout; }

    const createStorage = () => {
        const values = new Map();
        return {
            getItem: (key) => values.get(key) ?? null,
            setItem: (key, value) => values.set(key, value),
            removeItem: (key) => values.delete(key),
        };
    };
    globalThis.window = {
        localStorage: createStorage(),
        sessionStorage: createStorage(),
    };
    const { persistSession, restoreSession, clearSession } =
        await server.ssrLoadModule("/src/services/authSession.ts");
    persistSession(session);
    assert.deepEqual(restoreSession(), session);
    const stored = JSON.parse(window.localStorage.getItem("legacy-wealth-session"));
    assert.equal(stored.accessToken, fixture.data.accessToken);
    assert.equal(stored.refreshToken, fixture.data.refreshToken);
    assert.equal(stored.user.phoneNo, fixture.data.phoneNo);
    assert.equal(stored.user.role, "user");
    persistSession(session);
    assert.equal(window.sessionStorage.getItem("legacy-wealth-session"), null);
    assert.deepEqual(restoreSession(), session);
    window.localStorage.setItem(
        "legacy-wealth-session",
        JSON.stringify({ ...session, expiresAt: Date.now() - 1 }),
    );
    assert.equal(restoreSession(), null);
    assert.equal(window.localStorage.getItem("legacy-wealth-session"), null);
    persistSession(session);
    clearSession();
    assert.equal(restoreSession(), null);
    window.sessionStorage.setItem("legacy-wealth-session", JSON.stringify(session));
    assert.deepEqual(restoreSession(), session, "Existing sessions should migrate to localStorage.");
    assert.equal(window.sessionStorage.getItem("legacy-wealth-session"), null);
    assert.ok(window.localStorage.getItem("legacy-wealth-session"));
    clearSession();
    for (const invalid of ["{broken-json", JSON.stringify({ ...session, user: { ...session.user, role: "owner" } }), JSON.stringify({ ...session, user: { ...session.user, isDeleted: true } }), JSON.stringify({ ...session, accessToken: " " })]) {
        window.localStorage.setItem("legacy-wealth-session", invalid);
        assert.equal(restoreSession(), null);
        assert.equal(window.localStorage.getItem("legacy-wealth-session"), null);
    }
    const admin = parseLoginResponse({ ...fixture, data: { ...fixture.data, role: "Admin" } });
    window.localStorage.setItem("legacy-wealth-session", JSON.stringify(admin));
    window.sessionStorage.setItem("legacy-wealth-session", JSON.stringify(session));
    assert.deepEqual(restoreSession(), admin, "The persisted account takes precedence over a legacy tab session.");
    assert.equal(window.sessionStorage.getItem("legacy-wealth-session"), null, "A stale tab session must not survive and restore a signed-out account.");
    window.localStorage.setItem("legacy-wealth-theme", "dark");
    clearSession();
    assert.equal(window.localStorage.getItem("legacy-wealth-theme"), "dark");
    assert.equal(window.sessionStorage.getItem("legacy-wealth-session"), null);
    assert.equal(window.localStorage.getItem("legacy-wealth-session"), null);
    const unavailableStorage = { getItem() { throw new Error("Storage blocked"); }, setItem() { throw new Error("Storage blocked"); }, removeItem() { throw new Error("Storage blocked"); } };
    globalThis.window = { localStorage: unavailableStorage, sessionStorage: unavailableStorage };
    assert.doesNotThrow(() => persistSession(session));
    assert.equal(restoreSession(), null);
    assert.doesNotThrow(clearSession);
    console.log(
        "Auth checks passed: shared API envelope, backend login data, server roles, error codes/status, timeout, localStorage persistence/migration, expiry and sign-out.",
    );
} finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    await server.close();
}
