export type AuthUser = {
  id: string;
  organizationId: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

export type Credential = {
  id: string;
  appUserId: string;
  username: string;
  passwordHash: string;
  passwordChangedAt: Date;
  appUser: AuthUser;
};

export type Session = {
  id: string;
  appUserId: string;
  createdAt: Date;
  lastSeenAt: Date;
  idleExpiresAt: Date;
  absoluteExpiresAt: Date;
  revokedAt: Date | null;
  appUser: AuthUser;
};

export type AuthContext = Readonly<{
  sessionId: string;
  appUserId: string;
  organizationId: string;
  name: string;
}>;

export type IdentifierHashes = { identifierHash: string; ipHash: string | null };
