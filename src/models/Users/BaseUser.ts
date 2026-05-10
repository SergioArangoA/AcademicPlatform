// 2. Interfaz Base de Usuario (Campos que todos tienen)
export interface BaseUser {
  id: string;
  code: string;
  email: string;
  is_active: boolean;
  password_hash: string;
  created_at: string;
  updated_at: string;
}