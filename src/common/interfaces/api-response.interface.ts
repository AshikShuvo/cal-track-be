export interface IApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface IApiErrorResponse {
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path: string;
} 