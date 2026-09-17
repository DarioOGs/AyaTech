import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { Especie } from "../types";

export function useEspecies(soloActivas: boolean) {
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const base = collection(db, "especies");
    const q = soloActivas
      ? query(base, where("activo", "==", true), orderBy("nombre"))
      : query(base, orderBy("nombre"));

    const unsub = onSnapshot(q, (snap) => {
      setEspecies(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Especie)));
      setCargando(false);
    });
    return unsub;
  }, [soloActivas]);

  return { especies, cargando };
}
