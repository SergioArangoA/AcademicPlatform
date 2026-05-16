/** Envelope estándar del backend: { data: T, message?: string } */
export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}
