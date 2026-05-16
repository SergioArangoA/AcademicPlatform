import { AxiosResponse } from 'axios';
import { ApiEnvelope } from '../types/ApiResponse';

/** Extrae `data` del envelope del API o devuelve el cuerpo si ya viene plano. */
export function unwrapApiData<T>(response: AxiosResponse<ApiEnvelope<T> | T>): T {
  const body = response.data;

  if (body !== null && typeof body === 'object' && 'data' in body) {
    return (body as ApiEnvelope<T>).data;
  }

  return body as T;
}
