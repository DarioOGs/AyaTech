import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { Especie } from "../types";

export function useEspecies(soloActivas: boolean) {
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const base = collection(db, "especies");
    const q = soloActivas
      ? query(base, where("activo", "==", true), orderBy("nombre"))
      : query(base, orderBy("nombre"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setEspecies(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Especie)));
        setError("");
        setCargando(false);
      },
      (err) => {
        console.error("Error leyendo especies:", err);
        setError(
          err.code === "permission-denied"
            ? "No se pudo leer el catálogo: revisa que las reglas de Firestore ya estén publicadas."
            : "No se pudo cargar el catálogo. Revisa tu conexión."
        );
        setCargando(false);
      }
    );
    return unsub;
  }, [soloActivas]);

  return { especies, cargando, error };
}
