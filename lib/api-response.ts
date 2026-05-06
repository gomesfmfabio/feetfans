/**
 * Standardized API response helpers
 */

export class ApiResponse {
  static success<T>(data: T, message?: string) {
    return Response.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  static error(message: string, status: number = 400, details?: any) {
    return Response.json({
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString(),
    }, { status });
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return this.error(message, 403);
  }

  static notFound(message = 'Not found') {
    return this.error(message, 404);
  }

  static serverError(message = 'Internal server error', details?: any) {
    return this.error(message, 500, details);
  }
}
