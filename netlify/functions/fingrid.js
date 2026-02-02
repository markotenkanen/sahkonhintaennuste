const FINGRID_API_URL = "https://data.fingrid.fi/api/datasets/245/data";

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const { startTime, endTime, pageSize } = event.queryStringParameters || {};
  if (!startTime || !endTime) {
    return jsonResponse(400, { error: "Missing startTime or endTime query parameters." });
  }

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return jsonResponse(400, { error: "Invalid startTime or endTime format." });
  }

  const sizeValue = pageSize ? Number(pageSize) : 200;
  if (!Number.isFinite(sizeValue) || sizeValue <= 0 || sizeValue > 5000) {
    return jsonResponse(400, { error: "Invalid pageSize value." });
  }

  const apiKey = event.headers["x-api-key"] || event.headers["X-API-KEY"];
  if (!apiKey) {
    return jsonResponse(401, { error: "Missing Fingrid API key." });
  }

  const url = new URL(FINGRID_API_URL);
  url.searchParams.set("startTime", startDate.toISOString());
  url.searchParams.set("endTime", endDate.toISOString());
  url.searchParams.set("pageSize", sizeValue.toString());

  try {
    const response = await fetch(url.toString(), {
      headers: { "x-api-key": apiKey }
    });
    const body = await response.text();

    if (!response.ok) {
      return jsonResponse(response.status, {
        error: "Upstream error from Fingrid.",
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
    return jsonResponse(502, { error: "Failed to reach Fingrid.", details: error.message });
  }
};
