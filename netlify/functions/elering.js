export default async (request) => {
  try {
    const url = new URL(request.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");

    if (!start || !end) {
      return new Response(
        JSON.stringify({ error: "Missing start or end" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const upstream = new URL("https://dashboard.elering.ee/api/nps/price");
    upstream.searchParams.set("start", start);
    upstream.searchParams.set("end", end);

    const upstreamRes = await fetch(upstream.toString());
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
