import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth, db, googleProvider } from "../firebase/config";
import type { Usuario } from "../types";

interface AuthState {
  firebaseUser: User | null;
  usuario: Usuario | null;
  cargando: boolean;
  sinPermiso: boolean;
  iniciarSesion: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [sinPermiso, setSinPermiso] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setSinPermiso(false);
      setUsuario(null);

      if (user) {
        try {
          const snap = await getDoc(doc(db, "usuarios", user.uid));
          if (snap.exists()) {
            setUsuario(snap.data() as Usuario);
          } else {
            setSinPermiso(true);
          }
        } catch {
          setSinPermiso(true);
        }
      }
      setCargando(false);
    });
  }, []);

  async function iniciarSesion() {
    await signInWithPopup(auth, googleProvider);
  }

  async function cerrarSesion() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, usuario, cargando, sinPermiso, iniciarSesion, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
