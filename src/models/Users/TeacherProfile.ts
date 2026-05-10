import {BaseProfile} from "./BaseProfile";
// Extendemos la base para el profesor (añadiendo sus campos nulos)
export interface TeacherProfile extends BaseProfile {
  phone: string | null;
  specialty: string | null;
}