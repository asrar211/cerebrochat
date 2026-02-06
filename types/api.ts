export type ApiFieldErrors = Record<string, string>;

export type ApiError = {
  ok: false;
  error: {
    message: string;
    code: string;
    fieldErrors?: ApiFieldErrors;
  };
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
