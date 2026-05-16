// 2. Interfaz Base de Usuario (Campos que todos tienen)
import { BaseProfile } from "./BaseProfile";
export interface BaseUser {
  id: string;
  code: string;
  email: string;
  is_active: boolean;
  password_hash: string;
  created_at: string;
  updated_at: string;
  profile?: BaseProfile;
}