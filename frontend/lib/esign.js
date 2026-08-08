/**
 * Typed client for the PDF e-signature app (io.example.esign). Every DTO here
 * mirrors the Go structs in backend/internal/apps/esign; nothing on these
 * screens uses `any`.
 *
 * Two signing rails share one document store:
 *
 *   EID — eID Mongolia qualified remote signing. Asynchronous: the citizen's
 *         own device holds the key and approves with PIN2, so the browser
 *         starts a ceremony, shows a verification code and polls.
 *   HSM — Gerege eSign hardware module. Synchronous: prove a certificate,
 *         draw a signature, the service stamps it.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
/** Carries the backend's machine code so a screen can branch without parsing prose. */
export class EsignApiError extends Error {
    code;
    status;
    constructor(message, code, status) {
        super(message);
        this.name = "EsignApiError";
        this.code = code;
        this.status = status;
    }
}
function authHeaders(extra = {}) {
    const locale = typeof window !== "undefined" ? window.localStorage.getItem("locale") || "mn" : "mn";
    return { "Accept-Language": locale, ...extra };
}
/**
 * Reads a response without assuming it is JSON.
 *
 * An edge proxy answers 413, 502 and 504 with its own HTML page, so calling
 * res.json() straight would surface a raw `Unexpected token '<'` SyntaxError
 * to the user instead of a message about their file being too large.
 */
async function readJSON(res) {
    const text = await res.text();
    if (!text)
        return null;
    try {
        return JSON.parse(text);
    }
    catch {
        return null;
    }
}
/** Turns a status with no usable body into something a person can act on. */
export function httpErrorMessage(status) {
    if (status === 413)
        return "Файл хэт том байна.";
    if (status === 401 || status === 403)
        return "Нэвтрэлт дууссан эсвэл эрх хүрэхгүй байна.";
    if (status === 429)
        return "Хэт олон хүсэлт илгээлээ. Түр хүлээгээд дахин оролдоно уу.";
    if (status >= 500)
        return "Үйлчилгээ түр саатлаа. Дахин оролдоно уу.";
    return "Хүсэлт амжилтгүй боллоо.";
}
async function request(path, init = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: authHeaders({ "Content-Type": "application/json", ...init.headers }),
        credentials: "include",
    });
    if (!res.ok) {
        const body = await readJSON(res);
        throw new EsignApiError(body?.error || httpErrorMessage(res.status), body?.code || "UNKNOWN", res.status);
    }
    if (res.status === 204)
        return undefined;
    return ((await readJSON(res)) ?? undefined);
}
const toQuery = (params) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "" && value !== false)
            search.set(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : "";
};
async function download(path) {
    const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders(), credentials: "include" });
    if (!res.ok) {
        const body = await readJSON(res);
        throw new EsignApiError(body?.error || httpErrorMessage(res.status), body?.code || "UNKNOWN", res.status);
    }
    return res.blob();
}
/** Saves a blob under a filename without leaking the object URL. */
export function saveBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
export const esign = {
    // ─── Documents ────────────────────────────────────────────────────────────
    documents: (params = {}) => request(`/esign/documents${toQuery({ ...params, paginated: true })}`),
    document: (id) => request(`/esign/documents/${id}`),
    /**
     * Uploads through multipart rather than base64. The older JSON route still
     * exists for API clients, but sending a 25MB PDF as base64 costs a third
     * more bytes and forces the whole file through a string in the browser.
     */
    upload: async (file, title) => {
        const form = new FormData();
        form.set("file", file, file.name);
        if (title)
            form.set("title", title);
        const res = await fetch(`${API_BASE}/esign/documents/upload`, {
            method: "POST",
            headers: authHeaders(),
            body: form,
            credentials: "include",
        });
        if (!res.ok) {
            const body = await readJSON(res);
            throw new EsignApiError(body?.error || httpErrorMessage(res.status), body?.code || "UNKNOWN", res.status);
        }
        return (await readJSON(res));
    },
    remove: (id) => request(`/esign/documents/${id}`, { method: "DELETE" }),
    downloadDocument: (id, variant) => download(`/esign/documents/${id}/download?variant=${variant}`),
    // ─── eID Mongolia rail ────────────────────────────────────────────────────
    /** Starts a ceremony for a freshly picked file. */
    signFile: async (file, onBehalfOf, signerId) => {
        const form = new FormData();
        form.set("file", file, file.name);
        if (onBehalfOf)
            form.set("onBehalfOf", onBehalfOf);
        if (signerId)
            form.set("signer_id", signerId);
        const res = await fetch(`${API_BASE}/esign/sign/init`, {
            method: "POST",
            headers: authHeaders(),
            body: form,
            credentials: "include",
        });
        if (!res.ok) {
            const body = await readJSON(res);
            throw new EsignApiError(body?.error || httpErrorMessage(res.status), body?.code || "UNKNOWN", res.status);
        }
        return (await readJSON(res));
    },
    /**
     * Starts a ceremony for a document already in the store.
     *
     * signerId names the citizen when the account is not linked to eID. It goes
     * in the body rather than a form field because this route is JSON — the
     * multipart form value the upload path uses is not readable here.
     */
    signDocument: (documentId, onBehalfOf, signerId) => request("/esign/sign/init", {
        method: "POST",
        body: JSON.stringify({ document_id: documentId, on_behalf_of: onBehalfOf, signer_id: signerId }),
    }),
    session: (id) => request(`/esign/sign/${id}`),
    cancelSession: (id) => request(`/esign/sign/${id}/cancel`, { method: "POST" }),
    downloadSigned: (id) => download(`/esign/sign/${id}/download`),
    organizations: () => request("/esign/organizations"),
    // ─── HSM rail ─────────────────────────────────────────────────────────────
    checkCertificate: (body) => request("/esign/cert/check", { method: "POST", body: JSON.stringify(body) }),
    signWithHSM: (id, body) => request(`/esign/documents/${id}/sign`, { method: "POST", body: JSON.stringify(body) }),
    // ─── Signature log ────────────────────────────────────────────────────────
    logs: (filter = {}) => request(`/esign/logs${toQuery({ ...filter, paginated: true })}`),
    exportLogs: (filter = {}) => download(`/esign/logs/export${toQuery({ ...filter })}`),
    // ─── Batches ──────────────────────────────────────────────────────────────
    batches: (params = {}) => request(`/esign/batches${toQuery(params)}`),
    batch: (id) => request(`/esign/batches/${id}`),
    createBatch: (body) => request("/esign/batches", { method: "POST", body: JSON.stringify(body) }),
    /** Advances the batch by one document and returns the ceremony to confirm. */
    runBatch: (id) => request(`/esign/batches/${id}/run`, {
        method: "POST",
    }),
    cancelBatch: (id) => request(`/esign/batches/${id}/cancel`, { method: "POST" }),
    // ─── Settings ─────────────────────────────────────────────────────────────
    settings: () => request("/esign/settings"),
    savePlacement: (placement) => request("/esign/settings/placement", { method: "PUT", body: JSON.stringify(placement) }),
    savePolicy: (policy) => request("/esign/settings/policy", { method: "PUT", body: JSON.stringify(policy) }),
    testHSM: () => request("/esign/settings/hsm/test", { method: "POST" }),
};
