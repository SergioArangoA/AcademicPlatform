/**
 * Extrae un mensaje útil desde una respuesta de error de la API.
 *
 * Propósito:
 * - Normalizar estructuras de error que pueden variar entre endpoints.
 * - Priorizar campos comunes como `message`, `error` o `detail`.
 * - Centralizar el parseo para no duplicar esta lógica en los servicios.
 */
const extractApiMessage = (responseData: unknown): string => {
    if (!responseData || typeof responseData !== "object") {
        return "";
    }

    const candidate = responseData as Record<string, unknown>;
    const message = candidate.message ?? candidate.error ?? candidate.detail;

    return typeof message === "string" ? message : "";
};

export default extractApiMessage;