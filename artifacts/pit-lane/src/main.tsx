// Must be the first import — wipes stale cached data before any other module
// reads localStorage (see bootstrapCache.ts).
import "./bootstrapCache";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
