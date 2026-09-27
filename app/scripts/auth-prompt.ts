import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

export interface AuthPromptSession {
  prompt(
    label: string,
    hidden?: boolean,
  ): Promise<string>;
  close(): void;
}

export function createAuthPromptSession(): AuthPromptSession {
  if (
    !process.stdin.isTTY ||
    !process.stdout.isTTY
  ) {
    throw new Error("Use um terminal interativo.");
  }

  let hidden = false;

  const output = new Writable({
    write(chunk, _encoding, callback) {
      if (!hidden) {
        process.stdout.write(chunk);
      }

      callback();
    },
  });

  const reader = createInterface({
    input: process.stdin,
    output,
    terminal: true,
  });

  const controller = new AbortController();

  reader.on(
    "SIGINT",
    () => controller.abort(),
  );

  return {
    async prompt(
      label: string,
      hideInput = false,
    ): Promise<string> {
      if (!hideInput) {
        return reader.question(
          label,
          {
            signal: controller.signal,
          },
        );
      }

      process.stdout.write(label);
      hidden = true;

      try {
        return await reader.question(
          "",
          {
            signal: controller.signal,
          },
        );
      }
      finally {
        hidden = false;
        process.stdout.write("\n");
      }
    },

    close() {
      reader.close();
    },
  };
}
