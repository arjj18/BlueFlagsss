import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust exactly one proxy hop (Replit's reverse proxy). This ensures req.ip
// reflects the real client IP set by Replit's load balancer, and prevents
// attackers from spoofing the rate-limit key via a crafted X-Forwarded-For.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const allowedOrigins: Set<string> = new Set(
  (process.env.REPLIT_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => `https://${d}`),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (process.env.NODE_ENV !== "production" || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit for AI-backed endpoints. Uses req.ip derived from the trusted
// proxy chain (trust proxy: 1 above), so the key cannot be spoofed by callers.
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

app.use(
  ["/api/quiz/generate", "/api/standings/refresh", "/api/predict/race"],
  aiRateLimit,
);

app.use("/api", router);

export default app;
