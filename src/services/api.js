const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function apiRequest(path, { token, method = "GET", body } = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text || "Server returned an invalid response" };
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Option to logout here if needed, but keeping it simple for now
        throw new Error("Session expired. Please sign in again.");
      }
      throw new Error(data?.message || "Request failed");
    }

    return data;
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Could not connect to the server. Please check your internet connection.");
    }
    throw error;
  }
}
