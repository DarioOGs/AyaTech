import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { EntradaAuditoria } from "../types";

export function useAuditoria(cantidad = 80) {
  const [entradas, setEntradas] = useState<EntradaAuditoria[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "auditoria"), orderBy("fecha", "desc"), limit(cantidad));
    const unsub = onSnapshot(q, (snap) => {
      setEntradas(snap.docs.map((d) => ({ id: d.id, ...d.data() } as EntradaAuditoria)));
      setCargando(false);
    });
    return unsub;
  }, [cantidad]);

  return { entradas, cargando };
}
