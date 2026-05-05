import { clearAdminAuth, getAdminAuth, makeBasicAuth, saveAdminAuth } from "./auth.js";
import { API } from "../constants.js";

const BASE_URL = import.meta.env.VITE_API_URL || "";

class AdminAuthError extends Error {
  constructor(message = "Not authorized") {
    super(message);
    this.name = "AdminAuthError";
  }
}

async function adminRequest(path, { method = "GET", body, authHeader } = {}) {
  const auth = authHeader ?? getAdminAuth();
  if (!auth) throw new AdminAuthError("Not signed in.");

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: auth,
    },
    body: body == null ? undefined : JSON.stringify(body),
  });

  if (response.status === 401) {
    clearAdminAuth();
    throw new AdminAuthError("Session expired or credentials invalid.");
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const errBody = await response.json();
      detail = errBody.detail || JSON.stringify(errBody);
    } catch {
      // ignore
    }
    throw new Error(`${response.status}: ${detail}`);
  }

  if (response.status === 204) return { body: null, headers: response.headers };
  const responseBody = await response.json();
  return { body: responseBody, headers: response.headers };
}

export const adminApi = {
  async login(username, password) {
    const authHeader = makeBasicAuth(username, password);
    await adminRequest(API.ADMIN_LOGIN, { method: "POST", authHeader });
    saveAdminAuth(username, password);
  },
  async listStories({ q = "", status = "all", limit = 20, skip = 0 } = {}) {
    const params = new URLSearchParams({
      status,
      limit: String(limit),
      skip: String(skip),
    });
    if (q) params.set("q", q);
    const { body, headers } = await adminRequest(`${API.ADMIN_STORIES}?${params.toString()}`);
    const totalHeader = headers.get("X-Total-Count");
    const total = totalHeader != null ? Number(totalHeader) : body.length;
    return { items: body, total };
  },
  async setApproved(storyId, approved) {
    const { body } = await adminRequest(`${API.ADMIN_STORIES}/${storyId}`, {
      method: "PATCH",
      body: { approved },
    });
    return body;
  },
  async deleteStory(storyId) {
    await adminRequest(`${API.ADMIN_STORIES}/${storyId}`, { method: "DELETE" });
  },
};

export { AdminAuthError };
