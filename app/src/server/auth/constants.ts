export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 40;
export const PASSWORD_MIN_LENGTH = 15;
export const PASSWORD_MAX_LENGTH = 128;

// memoryCost is expressed in KiB.
export const ARGON2_MEMORY_COST = 19456;
export const ARGON2_TIME_COST = 2;
export const ARGON2_PARALLELISM = 1;
export const ARGON2_HASH_LENGTH = 32;

export const SESSION_TOKEN_BYTES = 32;

export const SESSION_IDLE_MINUTES = 30;
export const SESSION_ABSOLUTE_HOURS = 8;
export const SESSION_TOUCH_INTERVAL_MINUTES = 5;
export const REVOKED_SESSION_RETENTION_DAYS = 7;
export const RATE_LIMIT_WINDOW_MINUTES = 15;
export const RATE_LIMIT_BUCKET_RETENTION_HOURS = 24;
export const AUTH_SECRET_MIN_BYTES = 32;
export const LOGIN_ERROR = "Usuário ou senha inválidos.";
