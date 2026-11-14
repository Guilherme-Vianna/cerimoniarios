export class ServiceError extends Error {
  constructor(
    readonly status: 401 | 404 | 409 | 422 | 503,
    message: string,
  ) {
    super(message);
  }
}
