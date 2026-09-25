import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { Venta } from "../types";

export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "ventas"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setVentas(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Venta)));
        setCargando(false);
      },
      (err) => {
        console.error("Error leyendo ventas:", err);
        setCargando(false);
        setTimeout(() => setIntento((n) => n + 1), 4000);
      }
    );
    return unsub;
  }, [intento]);

  return { ventas, cargando };
}
