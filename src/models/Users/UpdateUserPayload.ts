// Payload plano que recibe el backend para crear/actualizar usuarios
export interface UpdateUserPayload {
  email?: string;
  code?: string;
  password?: string;
  is_active?: boolean;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  identification?: string;
  specialty?: string | null;
}