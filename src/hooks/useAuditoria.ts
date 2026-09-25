import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { EntradaAuditoria } from "../types";

export function useAuditoria(cantidad = 80) {
  const [entradas, setEntradas] = useState<EntradaAuditoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "auditoria"), orderBy("fecha", "desc"), limit(cantidad));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setEntradas(snap.docs.map((d) => ({ id: d.id, ...d.data() } as EntradaAuditoria)));
        setCargando(false);
      },
      (err) => {
        console.error("Error leyendo auditoría:", err);
        setCargando(false);
        setTimeout(() => setIntento((n) => n + 1), 4000);
      }
    );
    return unsub;
  }, [cantidad, intento]);

  return { entradas, cargando };
}
