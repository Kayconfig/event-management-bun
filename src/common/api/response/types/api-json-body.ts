export type ApiResponseJson<Data = unknown> = {
  statusCode: number;
  message: string;
  data?: Data | null;
  errors?: string[] | null;
};
