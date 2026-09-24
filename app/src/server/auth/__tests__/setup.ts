import { vi } from "vitest";

// Runtime tests execute in Node. Next enforces this boundary during production build.
vi.mock("server-only", () => ({}));
