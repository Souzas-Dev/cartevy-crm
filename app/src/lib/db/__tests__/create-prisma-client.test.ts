import {
  describe,
  expect,
  it,
} from "vitest";

import {
  resolveDatabaseSslConfig,
} from "@/lib/db/create-prisma-client";

describe("database SSL policy", () => {
  it("permite desabilitar TLS apenas para loopback IPv4", () => {
    expect(
      resolveDatabaseSslConfig(
        "postgresql://ci:ci@127.0.0.1:5432/cartevy",
        "disable",
      ),
    ).toBe(false);
  });

  it("permite desabilitar TLS para localhost", () => {
    expect(
      resolveDatabaseSslConfig(
        "postgresql://ci:ci@localhost:5432/cartevy",
        "disable",
      ),
    ).toBe(false);
  });

  it("recusa TLS desabilitado para banco remoto", () => {
    expect(() =>
      resolveDatabaseSslConfig(
        "postgresql://user:pass@db.example.com:5432/cartevy",
        "disable",
      ),
    ).toThrow(
      "DATABASE_SSL_MODE=disable só é permitido para banco local.",
    );
  });

  it("recusa modo TLS desconhecido", () => {
    expect(() =>
      resolveDatabaseSslConfig(
        "postgresql://user:pass@db.example.com:5432/cartevy",
        "prefer",
      ),
    ).toThrow(
      "DATABASE_SSL_MODE deve ser verify-full ou disable.",
    );
  });
});
