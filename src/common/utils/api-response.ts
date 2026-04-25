import type { Response } from "express";

class ApiResponse {
  private static send(
    res: Response,
    statusCode: number,
    success: boolean,
    message?: string,
    data?: unknown
  ) {
    return res.status(statusCode).json({
      success,
      message,
      data,
    });
  }

  static ok(res: Response, message = "Success", data?: unknown) {
    return this.send(res, 200, true, message, data);
  }

  static created(res: Response, message = "Created", data?: unknown) {
    return this.send(res, 201, true, message, data);
  }

  static noContent(res: Response, message = "No Content") {
    return this.send(res, 204, true, message);
  }
}

export default ApiResponse;