// 3. El Tipo de Respuesta de la API (Unión Discriminada)

import { BaseProfile } from "./BaseProfile";
import { BaseUser } from "./BaseUser";
import { TeacherProfile } from "./TeacherProfile";

// Esto es lo que importarás en tus servicios para tipar la respuesta
export type UserResponse = 

  | (BaseUser & { role: 'ADMIN' }) 
  | (BaseUser & { role: 'STUDENT'; profile: BaseProfile })
  | (BaseUser & { role: 'TEACHER'; profile: TeacherProfile });