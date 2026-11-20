import { API_MESSAGES, MIME_TYPES } from "@/constants/strings";
import { API_REQUEST_TIMEOUT_MS } from "@/constants/values";
import type { ApiRequestOptions } from "@/types/api";
import { isApiResponse } from "./apiResponse";

export class ApiError extends Error {
    readonly errorCode?: number;
    readonly status?: number;

    constructor(message: string, errorCode?: number, status?: number) {
        super(message);
        this.name = "ApiError";
        this.errorCode = errorCode;
        this.status = status;
    }
}

/** All HTTP requests and envelope validation stay in the services layer. */
export async function requestApi<T>(
    path: string,
    options: ApiRequestOptions,
    parseData: (data: unknown) => T,
): Promise<T> {
    if (options.body !== undefined && options.formData)
        throw new ApiError(API_MESSAGES.unavailable);
    const controller = new AbortController();
    const cancel = () => controller.abort();
    if (options.signal?.aborted) cancel();
    options.signal?.addEventListener("abort", cancel, { once: true });
    const timeout = setTimeout(
        cancel,
        options.timeoutMs ?? API_REQUEST_TIMEOUT_MS,
    );
    const messages = options.messages ?? API_MESSAGES;
    const baseUrl = (
        import.meta.env.API_ENV === "prod"
            ? import.meta.env.VITE_API_PROD_URL
            : import.meta.env.VITE_API_DEV_URL
    ).replace(/\/$/, "");

    console.log(baseUrl);
    console.log("Environment: ", import.meta.env.API_ENV);
    console.log("Prod Url: ", import.meta.env.VITE_API_PROD_URL);
    console.log("Dev Url: ", import.meta.env.VITE_API_DEV_URL);
    try {
        const response = await fetch(`${baseUrl}${path}`, {
            method: options.method ?? "GET",
            headers: {
                Accept: MIME_TYPES.json,
                ...(options.body !== undefined
                    ? { "Content-Type": MIME_TYPES.json }
                    : {}),
                ...(options.accessToken
                    ? { Authorization: `Bearer ${options.accessToken}` }
                    : {}),
            },
            ...(options.formData
                ? { body: options.formData }
                : options.body !== undefined
                  ? { body: JSON.stringify(options.body) }
                  : {}),
            signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => {
            throw new ApiError(
                messages.unavailable,
                undefined,
                response.status,
            );
        });
        if (!isApiResponse(payload))
            throw new ApiError(
                messages.unavailable,
                undefined,
                response.status,
            );
        if (!payload.success)
            throw new ApiError(
                payload.message,
                payload.errorCode,
                response.status,
            );
        if (!response.ok)
            throw new ApiError(
                messages.unavailable,
                undefined,
                response.status,
            );
        return parseData(payload.data);
    } catch (error) {
        if (options.signal?.aborted)
            throw new DOMException("Request cancelled", "AbortError");
        if (controller.signal.aborted) throw new ApiError(messages.timeout);
        if (error instanceof ApiError) throw error;
        throw new ApiError(messages.connection);
    } finally {
        clearTimeout(timeout);
        options.signal?.removeEventListener("abort", cancel);
    }
}
