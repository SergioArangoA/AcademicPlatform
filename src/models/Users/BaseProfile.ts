// 1. Interfaces de Perfil (Lo que describe a la persona)
export interface BaseProfile {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  first_name: string;
  last_name: string;
  identification: string;
}