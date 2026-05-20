import { User } from "../User";

export interface UserFormValidatorProps {
	mode: number; // 1 (crear) o 2 (actualizar), solo para texto/estilos
	handleAction: (values: User) => void;
	user?: User | null;
}
