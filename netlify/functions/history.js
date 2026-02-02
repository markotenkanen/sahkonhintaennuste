import { getStore } from "@netlify/blobs";

const store = getStore("forecast-history");

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  };
}

export const handler = async (event) => {
  if (event.httpMethod === "GET") {
    try {
      const history = (await store.get("history_log", { type: "json" })) || [];
      return jsonResponse(200, { history });
    } catch (error) {
      return jsonResponse(500, { error: "Failed to load history.", details: error.message });
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const payload = event.body ? JSON.parse(event.body) : null;
      if (!payload || !payload.entry || !payload.entry.date) {
        return jsonResponse(400, { error: "Missing entry data." });
      }

      const history = (await store.get("history_log", { type: "json" })) || [];
      const entry = payload.entry;
      const index = history.findIndex(item => item.date === entry.date);
      if (index >= 0) {
        history[index] = { ...history[index], ...entry };
      } else {
        history.push(entry);
      }

      history.sort((a, b) => new Date(a.date) - new Date(b.date));
      await store.set("history_log", history);
      return jsonResponse(200, { history });
    } catch (error) {
      return jsonResponse(500, { error: "Failed to save history.", details: error.message });
    }
  }

  return jsonResponse(405, { error: "Method not allowed" });
};
