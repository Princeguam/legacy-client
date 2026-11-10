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
        data: {
            id: "member-1",
            email: "member@example.com",
            firstName: "Alex",
            role: "User",
            accessToken: "test-token",
            expiresAt: Date.now() + 60000,
        },
    };

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
            new Response(JSON.stringify({ success: false, message }), {
                status,
            });
        await assert.rejects(
            login({ email: "member@example.com", password: "value" }),
            AuthError,
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
    persistSession(session, false);
    assert.deepEqual(restoreSession(), session);
    assert.equal(window.localStorage.getItem("legacy-wealth-session"), null);
    persistSession(session, true);
    assert.equal(window.sessionStorage.getItem("legacy-wealth-session"), null);
    assert.deepEqual(restoreSession(), session);
    window.localStorage.setItem(
        "legacy-wealth-session",
        JSON.stringify({ ...session, expiresAt: Date.now() - 1 }),
    );
    assert.equal(restoreSession(), null);
    assert.equal(window.localStorage.getItem("legacy-wealth-session"), null);
    persistSession(session, true);
    clearSession();
    assert.equal(restoreSession(), null);
    console.log(
        "Auth checks passed: validation, API contract, server roles, failure recovery, persistence and expiry.",
    );
} finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    await server.close();
}
