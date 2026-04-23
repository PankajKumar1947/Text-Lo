import type { Response } from "express";

interface ApiResponseProps<T = unknown> {
  res: Response;
  message?: string;
  data?: T;
}

class ApiResponse {
  private static send<T>(
    res: Response,
    statusCode: number,
    success: boolean,
    message?: string,
    data?: T
  ) {
    return res.status(statusCode).json({
      success,
      message,
      data
    })
  }

  static ok<T>({ res, message = "Success", data }: ApiResponseProps<T>) {
    return this.send(res, 200, true, message, data);
  }

  static created<T>({ res, message = "Created", data }: ApiResponseProps<T>) {
    return this.send(res, 201, true, message, data);
  }

  static noContent<T>({ res, message = "No Content", data }: ApiResponseProps<T>) {
    return this.send(res, 204, true, message, data);
  }
}

export default ApiResponse;