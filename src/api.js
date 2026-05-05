import { API } from "./constants.js";

const BASE_URL = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      // ignore
    }
    throw new Error(`${response.status}: ${detail}`);
  }
  if (response.status === 204) return { body: null, headers: response.headers };
  const body = await response.json();
  return { body, headers: response.headers };
}

export const api = {
  async listStories({ limit = 4, skip = 0 } = {}) {
    const { body, headers } = await request(`${API.STORIES}?limit=${limit}&skip=${skip}`);
    const totalHeader = headers.get("X-Total-Count");
    const total = totalHeader != null ? Number(totalHeader) : body.length;
    return { items: body, total };
  },
  async randomStory() {
    const { body } = await request(API.STORIES_RANDOM);
    return body;
  },
  async submitStory(payload) {
    const { body } = await request(API.STORIES, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return body;
  },
};
