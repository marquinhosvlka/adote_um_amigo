import { IAuthService, RegisterDTO, User } from '../../core/interfaces/IAuthService';
import { auth, db } from '../../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export class FirebaseAuthService implements IAuthService {
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async register(data: RegisterDTO): Promise<void> {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    await updateProfile(user, {
      displayName: data.name,
    });

    await setDoc(doc(db, 'users', user.uid), {
      name: data.name,
      email: data.email,
      phone: data.phone,
      createdAt: new Date(),
    });
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  getCurrentUser(): User | null {
    const user = auth.currentUser;
    if (!user) return null;

    return {
      id: user.uid,
      email: user.email!,
      name: user.displayName || undefined
    };
  }
}