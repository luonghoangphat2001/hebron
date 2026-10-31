export type BaseRESP<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

export type PaginationRESP<T> = BaseRESP<T> & {
  pagination: Pagination;
};

export type Pagination = {
  current_page?: number;
  per_page?: number;
  total_item?: number;
  total_page?: number;
};

export type ErrorRESP = {
  success?: boolean;
  message?: string;
  errors?: string;
};
