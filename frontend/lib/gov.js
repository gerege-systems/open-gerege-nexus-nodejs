/**
 * Typed client for the configurable government service workflow
 * (io.example.gov_services). Every DTO here mirrors the Go structs in
 * backend/internal/apps/gov_services; nothing on this screen uses `any`.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
/** An error carrying the backend's stable machine code. */
export class GovApiError extends Error {
    code;
    status;
    constructor(message, code, status) {
        super(message);
        this.name = "GovApiError";
        this.code = code;
        this.status = status;
    }
}
async function request(path, init = {}) {
    const locale = typeof window !== "undefined" ? window.localStorage.getItem("locale") || "mn" : "mn";
    const headers = {
        "Content-Type": "application/json",
        "Accept-Language": locale,
        ...init.headers,
    };
    const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: "include" });
    if (!res.ok) {
        let message = "Request failed";
        let code = "UNKNOWN";
        try {
            const body = (await res.json());
            message = body.error || message;
            code = body.code || code;
        }
        catch {
            // a non-JSON error body leaves the defaults in place
        }
        throw new GovApiError(message, code, res.status);
    }
    if (res.status === 204)
        return undefined;
    return (await res.json());
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
export const gov = {
    // Reference data
    services: () => request("/gov/services"),
    units: () => request("/gov/units"),
    unitTree: () => request("/gov/units/tree"),
    workflows: () => request("/gov/workflows"),
    templates: () => request("/gov/workflow-templates"),
    /** The list endpoint omits steps, so step-level SLA needs the version by id. */
    workflowVersion: (id) => request(`/gov/workflow-versions/${id}`),
    // Operations
    dashboard: () => request("/gov/dashboard"),
    tasks: (query = {}) => request(`/gov/tasks${toQuery({ ...query })}`),
    requestDetail: (id) => request(`/gov/requests/${id}`),
    act: (taskId, body) => request(`/gov/tasks/${taskId}/actions`, { method: "POST", body: JSON.stringify(body) }),
    ingest: (body) => request("/gov/requests/ingest", {
        method: "POST",
        body: JSON.stringify(body),
    }),
    appointments: () => request("/gov/appointments"),
    // mode: "ONLINE" asks the connected conferencing provider for a joining
    // link. The appointment is booked either way — a provider outage must not
    // cost the citizen their slot — so check meeting_error on the answer.
    bookAppointment: (body) => request("/gov/appointments", { method: "POST", body: JSON.stringify(body) }),
    requests: (query = {}) => request(`/gov/tasks${toQuery({ ...query })}`),
    // Configuration
    createService: (body) => request("/gov/services", { method: "POST", body: JSON.stringify(body) }),
    routingRules: () => request("/gov/routing-rules"),
    createRoutingRule: (body) => request("/gov/routing-rules", { method: "POST", body: JSON.stringify(body) }),
    createUnit: (body) => request("/gov/units", { method: "POST", body: JSON.stringify(body) }),
    createWorkflow: (body) => request("/gov/workflows", { method: "POST", body: JSON.stringify(body) }),
    publishVersion: (id) => request(`/gov/workflow-versions/${id}/publish`, { method: "POST" }),
    configureService: (id, body) => request(`/gov/services/${id}/configuration`, {
        method: "PUT",
        body: JSON.stringify(body),
    }),
};
/** Actions the UI may offer for a status. The backend re-validates every one. */
export function availableActions(status) {
    switch (status) {
        case "RECEIVED":
            return ["assign", "start", "delegate", "reject"];
        case "ASSIGNED":
            return ["start", "delegate", "request_info", "complete", "reject"];
        case "IN_PROGRESS":
            return ["delegate", "request_info", "complete", "reject"];
        case "INFO_REQUESTED":
            return ["start", "reject"];
        case "RETURNED":
            return ["start", "complete", "reject"];
        case "AWAITING_VERIFICATION":
            return ["verify", "return"];
        case "COMPLETED":
            return ["close"];
        default:
            return [];
    }
}
/** Permission each action needs, so the UI hides what the user cannot do. */
export const ACTION_PERMISSION = {
    assign: "gov.process",
    start: "gov.process",
    delegate: "gov.delegate",
    request_info: "gov.process",
    complete: "gov.process",
    verify: "gov.verify",
    return: "gov.verify",
    reject: "gov.process",
    cancel: "gov.apply",
    close: "gov.process",
};
/** Actions the backend refuses without a comment. */
export const ACTION_REQUIRES_COMMENT = ["reject", "return", "request_info"];
