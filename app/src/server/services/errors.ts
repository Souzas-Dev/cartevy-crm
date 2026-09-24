export class DuplicateOrderError extends Error {
  constructor(orderNumber: string) {
    super(
      `O pedido ${orderNumber} já está registrado no Cartevy.`,
    );
    this.name = "DuplicateOrderError";
  }
}

export class CustomerIdentityConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomerIdentityConflictError";
  }
}

export class CustomerNotFoundError extends Error {
  constructor() {
    super("Cliente não encontrado nesta organização.");
    this.name = "CustomerNotFoundError";
  }
}
