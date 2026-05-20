import { UpdateUserPayload } from "../Users/UpdateUserPayload";
import { UserResponse } from "../Users/UserResponse";

export interface UserFormProps {
	mode: 1 | 2 | 3; // 1 = Crear, 2 = Actualizar, 3 = Ver
	handleAction: (values: UpdateUserPayload, role: "ADMIN" | "STUDENT" | "TEACHER") => void;
	user?: UserResponse | null;
}
