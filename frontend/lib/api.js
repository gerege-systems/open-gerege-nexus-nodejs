const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api/v1" : "http://localhost:8080/api/v1");
async function fetcher(url, options = {}) {
    // Server-owned content (menu labels, app store copy) is translated by the
    // API, so every request carries the locale the user picked.
    const locale = typeof window !== "undefined" ? window.localStorage.getItem("locale") || "mn" : "mn";
    const headers = {
        "Content-Type": "application/json",
        "Accept-Language": locale,
        ...(typeof window !== "undefined" && window.localStorage.getItem("auth_token")
            ? { Authorization: `Bearer ${window.localStorage.getItem("auth_token")}` }
            : {}),
        ...options.headers,
    };
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
        credentials: "include",
    });
    if (!res.ok) {
        let errMessage = "Request failed";
        try {
            const errData = await res.json();
            errMessage = errData.error || errData.message || errMessage;
        }
        catch {
            // ignore
        }
        // The status rides along so a caller can tell a transient failure from an
        // answer: a polling loop should retry a dropped connection and stop on a 409.
        const failure = new Error(errMessage);
        failure.status = res.status;
        throw failure;
    }
    // 204 carries no body by definition, so parsing one would throw on success.
    if (res.status === 204) {
        return undefined;
    }
    const payload = await res.json();
    // Collection and CRUD endpoints consistently wrap their result in `data`.
    // Keep authentication/status responses intact, but expose domain data in
    // the shape consumed by pages so every caller does not reimplement this.
    if (payload && Object.prototype.hasOwnProperty.call(payload, "data"))
        return payload.data;
    return payload;
}
export const APP_MENU_CHANGED_EVENT = "gerege:app-menu-changed";
async function mutateApp(url) {
    const result = await fetcher(url, { method: "POST" });
    // Layout lives above the App Store pages, so a route refresh does not
    // recreate it. Notify the mounted shell to refetch tenant menus immediately.
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(APP_MENU_CHANGED_EVENT, { detail: result }));
    }
    return result;
}
export const api = {
    // Auth
    login: async (email, password) => {
        const result = await fetcher("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        if (result.token)
            window.localStorage.setItem("auth_token", result.token);
        return result;
    },
    loginWithEID: (code, redirectURI, regNumber, otpCode, authMethod) => fetcher("/auth/eid/login", {
        method: "POST",
        body: JSON.stringify({ code, redirect_uri: redirectURI, reg_number: regNumber, otp_code: otpCode, auth_method: authMethod }),
    }),
    startEID: (callbackUrl = "") => fetcher("/auth/eid/start", { method: "POST", body: JSON.stringify({ callbackUrl }) }),
    startEIDByNationalID: (nationalId, callbackUrl = "") => fetcher("/auth/eid/start-id", { method: "POST", body: JSON.stringify({ national_id: nationalId, callbackUrl }) }),
    // The poll is a long poll the API holds open for up to 25s, so the caller
    // passes a signal to drop it the moment the citizen cancels or leaves.
    pollEID: async (sessionId, signal) => {
        const result = await fetcher("/auth/eid/poll", { method: "POST", body: JSON.stringify({ session_id: sessionId }), signal });
        if (result.state === "COMPLETE" && result.token)
            window.localStorage.setItem("auth_token", result.token);
        return result;
    },
    loginWithDAN: (danToken, regNumber, otpCode) => fetcher("/auth/dan/login", {
        method: "POST",
        body: JSON.stringify({ dan_token: danToken, reg_number: regNumber, otp_code: otpCode }),
    }),
    logout: async () => {
        try {
            return await fetcher("/auth/logout", { method: "POST" });
        }
        finally {
            window.localStorage.removeItem("auth_token");
        }
    },
    // permissions carries the effective grant of every role the member holds; it
    // is empty for administrators, who bypass the check.
    getMe: async () => (await fetcher("/auth/me")).user,
    getMenus: async () => (await fetcher("/menus")).menus,
    // Odoo-style tenant access control
    getAccessOverview: () => fetcher("/admin/access/overview"),
    createRole: (data) => fetcher("/admin/access/roles", { method: "POST", body: JSON.stringify(data) }),
    updateRole: (id, data) => fetcher(`/admin/access/roles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteRole: (id) => fetcher(`/admin/access/roles/${id}`, { method: "DELETE" }),
    setRolePermissions: (id, permissions) => fetcher(`/admin/access/roles/${id}/permissions`, { method: "PUT", body: JSON.stringify({ permissions }) }),
    setMembershipRoles: (id, roles) => fetcher(`/admin/access/memberships/${id}/roles`, { method: "PUT", body: JSON.stringify({ roles }) }),
    // Store
    getStoreApps: () => fetcher("/store/apps"),
    getInstalledApps: () => fetcher("/installed-apps"),
    installApp: (slug) => mutateApp(`/store/apps/${slug}/install`),
    enableApp: (slug) => mutateApp(`/store/apps/${slug}/enable`),
    disableApp: (slug) => mutateApp(`/store/apps/${slug}/disable`),
    // Contacts App
    getContacts: () => fetcher("/contacts"),
    createContact: (data) => fetcher("/contacts", { method: "POST", body: JSON.stringify(data) }),
    updateContact: (id, data) => fetcher(`/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    // Products App
    getProducts: () => fetcher("/products"),
    createProduct: (data) => fetcher("/products", { method: "POST", body: JSON.stringify(data) }),
    updateProduct: (id, data) => fetcher(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    // Inventory App
    getWarehouses: () => fetcher("/inventory/warehouses"),
    createWarehouse: (data) => fetcher("/inventory/warehouses", { method: "POST", body: JSON.stringify(data) }),
    getStockLevels: () => fetcher("/inventory/stock-levels"),
    getStockMovements: () => fetcher("/inventory/movements"),
    adjustStock: (data) => fetcher("/inventory/adjustments", { method: "POST", body: JSON.stringify(data) }),
    // AI Assistant & Forecasting
    queryAICopilot: (prompt) => fetcher("/ai/copilot", {
        method: "POST",
        body: JSON.stringify({ prompt }),
    }),
    chatAI: (data) => fetcher("/ai/chat", {
        method: "POST", body: JSON.stringify(data),
    }),
    speakAI: (text) => fetcher("/ai/tts", {
        method: "POST", body: JSON.stringify({ text }),
    }),
    translateAI: (data) => fetcher("/ai/translate", {
        method: "POST", body: JSON.stringify(data),
    }),
    getAIPrompts: () => fetcher("/admin/ai/prompts"),
    updateAIPrompt: (key, content, active = true) => fetcher(`/admin/ai/prompts/${key}`, { method: "PUT", body: JSON.stringify({ content, active }) }),
    getAIKnowledge: () => fetcher("/admin/ai/knowledge"),
    createAIKnowledge: (data) => fetcher("/admin/ai/knowledge", { method: "POST", body: JSON.stringify(data) }),
    getAIForecast: () => fetcher("/ai/stock-forecast"),
    // XYP State Data Exchange (xyp.gerege.mn)
    queryXYPCitizen: (regNumber) => fetcher("/xyp/citizen", {
        method: "POST",
        body: JSON.stringify({ reg_number: regNumber }),
    }),
    queryXYPCompany: (companyReg) => fetcher("/xyp/company", {
        method: "POST",
        body: JSON.stringify({ company_reg: companyReg }),
    }),
    // External Integrations Manager.
    //
    // Connectors are per tenant and stored server-side; the secret and any OAuth
    // grant are write-only, so nothing here ever reads a credential back.
    getIntegrations: () => fetcher("/integrations"),
    // Which providers this deployment can actually offer. A provider whose OAuth
    // client was never configured comes back unavailable with the reason, so the
    // screen can say why instead of showing a form that cannot work.
    getIntegrationProviders: () => fetcher("/integrations/providers"),
    registerIntegration: (data) => fetcher("/integrations", { method: "POST", body: JSON.stringify(data) }),
    updateIntegration: (id, data) => fetcher(`/integrations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteIntegration: (id) => fetcher(`/integrations/${id}`, { method: "DELETE" }),
    // Starts the OAuth grant. The answer is the provider URL to send the
    // administrator to; the callback lands back on the settings screen.
    connectIntegration: (id) => fetcher(`/integrations/${id}/connect`, { method: "POST" }),
    disconnectIntegration: (id) => fetcher(`/integrations/${id}/disconnect`, { method: "POST" }),
    // What has recently left the platform. A signed document reaching an outside
    // account is a disclosure, and this is the record of it.
    getIntegrationDeliveries: (limit = 50) => fetcher(`/integrations/deliveries?limit=${limit}`),
    // Send an already-signed document to a storage connector. Automatic export
    // covers documents signed after a connector was set up; this covers the ones
    // signed before it, and the retry after a destination was unreachable.
    exportEsignDocument: (id, integrationId) => fetcher(`/esign/documents/${id}/export`, { method: "POST", body: JSON.stringify(integrationId ? { integration_id: integrationId } : {}) }),
    // Billing App (io.example.billing)
    getInvoices: () => fetcher("/billing/invoices"),
    createInvoice: (data) => fetcher("/billing/invoices", { method: "POST", body: JSON.stringify(data) }),
    // Documents App (io.example.documents)
    // One page of a tenant's documents, newest first, with how many there are in total —
    // each row counts its own signatures and outstanding steps, so the list cannot be
    // unbounded, and a screen showing part of it has to be able to say so.
    getDocuments: (params) => {
        const query = new URLSearchParams();
        if (params?.status)
            query.set("status", params.status);
        if (params?.doc_type)
            query.set("doc_type", params.doc_type);
        if (params?.q)
            query.set("q", params.q);
        if (params?.order)
            query.set("order", params.order);
        if (params?.limit)
            query.set("limit", String(params.limit));
        if (params?.offset)
            query.set("offset", String(params.offset));
        if (params?.after_at && params?.after_id) {
            query.set("after_at", params.after_at);
            query.set("after_id", params.after_id);
        }
        const suffix = query.toString() ? `?${query}` : "";
        return fetcher(`/documents${suffix}`);
    },
    // A title can be corrected until the first signature; after that it is what the
    // citizen read on their own device before approving.
    renameDocument: (id, title) => fetcher(`/documents/${id}/title`, { method: "PUT", body: JSON.stringify({ title }) }),
    createDocument: (data) => fetcher("/documents", { method: "POST", body: JSON.stringify(data) }),
    // E-ID signing is an approval the citizen gives on their own device: start
    // pushes the request — naming the document — and poll waits for them to answer.
    // eID has no document-signing endpoint; that approval is the signature.
    startEIDSignature: (id, regNumber) => fetcher(`/documents/${id}/sign/eid/start`, { method: "POST", body: JSON.stringify({ reg_number: regNumber }) }),
    // The API holds this open for up to 25s, so the caller passes a signal to drop
    // it the moment the operator closes the dialog.
    pollEIDSignature: (id, sessionId, signal) => fetcher(`/documents/${id}/sign/eid/poll`, {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId }),
        signal,
    }),
    // DAN exposes no approval push, so it stays a registration number and a code.
    signDocumentWithDAN: (id, data) => fetcher(`/documents/${id}/sign/dan`, { method: "POST", body: JSON.stringify(data) }),
    // Send a draft for approval.
    routeDocument: (id) => fetcher(`/documents/${id}/route`, { method: "POST" }),
    // A document's signature ledger, oldest first.
    getDocumentSignatures: (id) => fetcher(`/documents/${id}/signatures`),
    // The document's OWN approval chain — the copy taken when it started waiting,
    // which a later configuration change does not touch.
    getDocumentSteps: (id) => fetcher(`/documents/${id}/steps`),
    // Templates a document is started from
    getDocumentTemplates: () => fetcher("/documents/templates"),
    createDocumentTemplate: (data) => fetcher("/documents/templates", { method: "POST", body: JSON.stringify(data) }),
    updateDocumentTemplate: (id, data) => fetcher(`/documents/templates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteDocumentTemplate: (id) => fetcher(`/documents/templates/${id}`, { method: "DELETE" }),
    useDocumentTemplate: (id) => fetcher(`/documents/templates/${id}/use`, { method: "POST" }),
    // How each document type may be signed
    getSignaturePolicies: () => fetcher("/documents/policies"),
    saveSignaturePolicy: (docType, data) => fetcher(`/documents/policies/${docType}`, { method: "PUT", body: JSON.stringify(data) }),
    // Who must sign each document type, in order
    getDocumentWorkflows: () => fetcher("/documents/workflows"),
    saveDocumentWorkflow: (docType, steps) => fetcher(`/documents/workflows/${docType}`, { method: "PUT", body: JSON.stringify({ steps }) }),
    // How long each document type is kept
    getRetentionRules: () => fetcher("/documents/retention"),
    saveRetentionRule: (docType, data) => fetcher(`/documents/retention/${docType}`, { method: "PUT", body: JSON.stringify(data) }),
    // Reject a pending document — moves it to REJECTED.
    rejectDocument: (id) => fetcher(`/documents/${id}/reject`, { method: "POST" }),
    // PDF E-Sign App (io.example.esign)
    getEsignDocuments: () => fetcher("/esign/documents"),
    uploadEsignDocument: (data) => fetcher("/esign/documents", { method: "POST", body: JSON.stringify(data) }),
    checkEsignCert: (data) => fetcher("/esign/cert/check", { method: "POST", body: JSON.stringify(data) }),
    signEsignDocument: (id, data) => fetcher(`/esign/documents/${id}/sign`, {
        method: "POST",
        body: JSON.stringify(data),
    }),
    getEsignLogs: () => fetcher("/esign/logs"),
    downloadEsignDocument: async (id, variant) => {
        const res = await fetch(`${API_BASE}/esign/documents/${id}/download?variant=${variant}`, {
            credentials: "include",
        });
        if (!res.ok)
            throw new Error("Download failed");
        return res.blob();
    },
    // Email verification.
    //
    // The keys are write-once: createEmailVerifyClient is the only call that ever
    // returns one, and there is no call that reads one back, because the server
    // stores only its hash. Losing it means issuing a new one.
    getEmailVerifyOverview: (limit = 25) => fetcher(`/admin/email-verification/overview?limit=${limit}`),
    getEmailVerifyClients: () => fetcher("/admin/email-verification/clients"),
    createEmailVerifyClient: (data) => fetcher("/admin/email-verification/clients", {
        method: "POST",
        body: JSON.stringify(data),
    }),
    updateEmailVerifyClient: (id, data) => fetcher(`/admin/email-verification/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }),
    deleteEmailVerifyClient: (id) => fetcher(`/admin/email-verification/clients/${id}`, { method: "DELETE" }),
    // The same endpoint outside callers use, reached with the session instead of
    // a client key — so the screen can prove the flow works end to end without
    // the product having to hold a key it issued to itself.
    sendEmailVerification: (data) => fetcher("/verify/send", { method: "POST", body: JSON.stringify(data) }),
    // Developer Portal & OAuth2 SSO Apps
    getDeveloperApps: () => fetcher("/developer/apps"),
    createDeveloperApp: (clientName, redirectURIs, scopes) => fetcher("/developer/apps", {
        method: "POST",
        body: JSON.stringify({ client_name: clientName, redirect_uris: redirectURIs, scopes }),
    }),
};
