// Best-effort per-IP rate limiter for Vercel serverless functions, mirroring
// the express-rate-limit config on the Replit backend (10 req / 15 min / IP on
// AI endpoints). State is per warm function instance — not a durable store —
// so it degrades under heavy horizontal scaling, but it stops the common case
// of a single client hammering the paid AI endpoints.
const WINDOW_MS = 15 * 60 * 1000;

const buckets = new Map();

function clientIp(req) {
  // Vercel sets x-real-ip / x-forwarded-for from its own edge, so the first
  // entry is the real client as seen by Vercel and not caller-spoofable.
  const fwd = req.headers["x-forwarded-for"];
  const first = Array.isArray(fwd) ? fwd[0] : (fwd ?? "").split(",")[0].trim();
  return req.headers["x-real-ip"] || first || "unknown";
}

export function rateLimit(req, res, limit = 10) {
  const now = Date.now();

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (buckets.size > 1000) {
    for (const [key, b] of buckets) {
      if (now - b.start > WINDOW_MS) buckets.delete(key);
    }
  }

  const ip = clientIp(req);
  let bucket = buckets.get(ip);
  if (!bucket || now - bucket.start > WINDOW_MS) {
    bucket = { start: now, count: 0 };
    buckets.set(ip, bucket);
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return false;
  }
  return true;
}
