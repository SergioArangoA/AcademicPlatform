import axios from 'axios';
import extractApiMessage from './extractApiMessage';

/** Mensaje legible para el usuario cuando falla el inicio de sesión */
export function getLoginErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiMessage = extractApiMessage(error.response?.data);

    if (status === 401 || status === 403) {
      return (
        apiMessage ||
        'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.'
      );
    }

    if (status === 404) {
      return apiMessage || 'No encontramos una cuenta con ese correo.';
    }

    if (apiMessage) return apiMessage;

    return 'No se pudo iniciar sesión. Intenta de nuevo más tarde.';
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: string }).code);

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-login-credentials':
        return 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/user-disabled':
        return 'Esta cuenta está deshabilitada. Contacta al administrador.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Espera un momento e intenta de nuevo.';
      case 'auth/network-request-failed':
        return 'Sin conexión. Revisa tu internet e intenta de nuevo.';
      case 'auth/popup-closed-by-user':
        return 'Inicio de sesión cancelado.';
      case 'auth/account-exists-with-different-credential':
        return 'Ya existe una cuenta con ese correo usando otro método de acceso.';
      default:
        break;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    const msg = error.message.trim();
    if (msg.includes('Login failed') || msg.includes('invalid')) {
      return 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.';
    }
    return msg;
  }

  return 'No se pudo iniciar sesión. Verifica tu correo y contraseña.';
}
