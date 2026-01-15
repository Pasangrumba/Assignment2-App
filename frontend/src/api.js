const API_BASE = (() => {
  if (process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://127.0.0.1:5000/api";
  }
  return "https://assignment2-app-backend.onrender.com/api";
})();

export const getToken = () => localStorage.getItem("token");

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
};

export const authApi = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => request("/auth/me"),
  updateMe: (payload) =>
    request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export const tagsApi = {
  list: () => request("/tags"),
};

export const workspacesApi = {
  list: () => request("/workspaces"),
};

export const assetsApi = {
  listPublished: () => request("/assets"),
  listMine: () => request("/assets/mine"),
  getById: (id) => request(`/assets/${id}`),
  create: (payload) =>
    request("/assets", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateDraft: (id, payload) =>
    request(`/assets/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteDraft: (id) =>
    request(`/assets/${id}`, {
      method: "DELETE",
    }),
  resetMine: () =>
    request("/assets/reset", {
      method: "POST",
    }),
  submitForReview: (id) =>
    request(`/assets/${id}/submit`, {
      method: "PUT",
    }),
};

export const governanceApi = {
  approveAsset: (id, comments) =>
    request(`/governance/assets/${id}/approve`, {
      method: "PUT",
      body: JSON.stringify({ comments }),
    }),
  listPending: (workspaceId) => request(`/governance/pending${workspaceId ? `?workspaceId=${workspaceId}` : ""}`),
  rejectAsset: (id, review_comment) =>
    request(`/governance/assets/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ review_comment }),
    }),
  submitAsset: (id) =>
    request(`/governance/assets/${id}/submit`, {
      method: "PUT",
    })
};

export const recommendationsApi = {
  list: (workspaceId) =>
    request(`/recommendations${workspaceId ? `?workspaceId=${workspaceId}` : ""}`),
};
