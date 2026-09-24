import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

// Refuse redirected input: passwords must not be piped or supplied via CLI arguments.
export async function prompt(label: string, hidden = false): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error("Use um terminal interativo.");
  process.stdout.write(label);
  const output = new Writable({ write(chunk, _encoding, callback) {
    if (!hidden) process.stdout.write(chunk);
    callback();
  } });
  const reader = createInterface({ input: process.stdin, output, terminal: true });
  const controller = new AbortController();
  reader.on("SIGINT", () => controller.abort());
  reader.on("close", () => controller.abort());
  try {
    return await reader.question("", { signal: controller.signal });
  } finally {
    reader.close();
    if (hidden) process.stdout.write("\n");
  }
}
