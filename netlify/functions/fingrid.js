export default async (request) => {
  try {
    const url = new URL(request.url);
    const startTime = url.searchParams.get("startTime");
    const endTime = url.searchParams.get("endTime");
    const pageSize = url.searchParams.get("pageSize") || "200";

    if (!startTime || !endTime) {
      return new Response(
        JSON.stringify({ error: "Missing startTime or endTime" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const apiKey =
      request.headers.get("x-api-key") || request.headers.get("X-Api-Key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing Fingrid API key" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }

    const upstream = new URL("https://data.fingrid.fi/api/datasets/245/data");
    upstream.searchParams.set("startTime", startTime);
    upstream.searchParams.set("endTime", endTime);
    upstream.searchParams.set("pageSize", pageSize);

    const upstreamRes = await fetch(upstream.toString(), {
      headers: {
        "x-api-key": apiKey
      }
    });

    const body = await upstreamRes.text();
    return new Response(body, {
      status: upstreamRes.status,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") || "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
};
