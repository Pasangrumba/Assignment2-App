const API_BASE =
  process.env.REACT_APP_API_BASE || "https://assignment2-app-ae32.onrender.com/api";

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
};

export const tagsApi = {
  list: () => request("/tags"),
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
  resetMine: () =>
    request("/assets/reset", {
      method: "POST",
    }),
  submitForReview: (id) =>
    request(`/assets/${id}/submit`, {
      method: "POST",
    }),
};

export const governanceApi = {
  approveAsset: (id, comments) =>
    request(`/governance/assets/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ comments }),
    }),
};
