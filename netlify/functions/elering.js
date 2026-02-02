const ELERING_API_URL = "https://dashboard.elering.ee/api/nps/price";

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
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const { start, end } = event.queryStringParameters || {};
  if (!start || !end) {
    return jsonResponse(400, { error: "Missing start or end query parameters." });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return jsonResponse(400, { error: "Invalid start or end format." });
  }

  const url = new URL(ELERING_API_URL);
  url.searchParams.set("start", startDate.toISOString());
  url.searchParams.set("end", endDate.toISOString());

  try {
    const response = await fetch(url.toString());
    const body = await response.text();

    if (!response.ok) {
      return jsonResponse(response.status, {
        error: "Upstream error from Elering.",
        status: response.status,
        details: body
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json"
      },
      body
    };
  } catch (error) {
    return jsonResponse(502, { error: "Failed to reach Elering.", details: error.message });
  }
};
