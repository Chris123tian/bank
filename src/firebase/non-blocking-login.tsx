'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';

/** 
 * Initiate anonymous sign-in. 
 * Returns the promise so callers can handle UI states (loaders, errors).
 */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** 
 * Initiate email/password sign-up. 
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Initiate email/password sign-in. 
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Initiate Google sign-in. 
 */
export function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  // Using popup which is standard for web apps; 
  // ensure component handles errors if popup is blocked.
  return signInWithPopup(authInstance, provider);
}

/** Initiate sign-out. */
export async function initiateSignOut(authInstance: Auth): Promise<void> {
  try {
    await signOut(authInstance);
  } catch (error) {
    console.error("Sign out error:", error);
  }
}
