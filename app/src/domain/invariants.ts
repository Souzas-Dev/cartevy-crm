export class DomainInvariantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainInvariantError";
  }
}

export function assertSameOrganization(
  expectedOrganizationId: string,
  actualOrganizationId: string,
  relationName: string,
): void {
  if (expectedOrganizationId !== actualOrganizationId) {
    throw new DomainInvariantError(
      `${relationName} pertence a outra organização.`,
    );
  }
}
