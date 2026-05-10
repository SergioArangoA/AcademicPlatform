import { UserResponse } from "../models/Users/UserResponse";

/**
 * Resultado estandarizado para mutaciones de usuarios.
 *
 * Propósito:
 * - Unificar la respuesta de acciones como crear usuario.
 * - Permitir que la UI reciba un estado de éxito, un mensaje legible y el dato creado.
 * - Evitar repetir lógica de parsing en cada pantalla o servicio consumidor.
 */
export type UserMutationResult = {
    success: boolean;
    message: string;
    data: UserResponse | null;
};