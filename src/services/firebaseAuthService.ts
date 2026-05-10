import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  getIdToken,
} from "firebase/auth";
import { auth, google, github, microsoft } from "../firebaseConfig";

class FirebaseAuthService {
  /**
   * Suscribe un callback a los cambios de estado de autenticación en Firebase
   */
  onAuthStateChange(callback: (user: User | null, token: string | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await getIdToken(firebaseUser, true);
        callback(firebaseUser, idToken);
      } else {
        callback(null, null);
      }
    });
  }

  /**
   * Inicia sesión con Google mediante ventana emergente
   */
  async loginWithGoogle() {
    const result = await signInWithPopup(auth, google);
    const idToken = await result.user.getIdToken();
    return { user: result.user, token: idToken };
  }

  /**
   * Inicia sesión con GitHub mediante ventana emergente
   */
  async loginWithGitHub() {
    const result = await signInWithPopup(auth, github);
    const idToken = await result.user.getIdToken();
    return { user: result.user, token: idToken };
  }


  /**
   * Inicia sesión con Microsoft
   */
  async loginWithMicrosoft() {
    const result = await signInWithPopup(auth, microsoft);

    const idToken = await result.user.getIdToken();

    return {
      user: result.user,
      token: idToken,
    };
  }


  /**
   * Cierra la sesión activa en Firebase
   */
  async logout() {
    await signOut(auth);
  }
}

export default new FirebaseAuthService();
