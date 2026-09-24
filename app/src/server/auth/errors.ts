export class InvalidPasswordError extends Error {
  constructor() {
    super("Password must contain between 15 and 128 Unicode code points.");
    this.name = "InvalidPasswordError";
  }
}

export class AuthCryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthCryptoError";
  }
}
