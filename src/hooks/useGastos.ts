import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { Gasto } from "../types";

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "gastos"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setGastos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Gasto)));
      setCargando(false);
    });
    return unsub;
  }, []);

  return { gastos, cargando };
}
