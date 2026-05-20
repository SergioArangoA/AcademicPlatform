import { BaseProfile } from "./BaseProfile";
export interface UserForList {
  id: string;
  code: string;
  name: string;
  email: string;
  role:string;
  is_active: boolean;
  created_at: string;
  registration_id?: string | null;
  profile?: BaseProfile;
  identification: string | null;
}