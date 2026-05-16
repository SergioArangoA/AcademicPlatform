import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdToken,
  getAuth,
  createUserWithEmailAndPassword,
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
   * Registra al usuario en firebase automáticamente
   */
  async registerWithEmailPassword(email: string, password: string) {

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    return result.user;
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
   * Inicia sesión con email y contraseña en Firebase
   */
  async loginWithEmailPassword(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    return { user: result.user, token: idToken };
  }

  /**
   * Cierra la sesión activa en Firebase
   */
  async logout() {
    await signOut(auth);
  }
}

export default new FirebaseAuthService();
