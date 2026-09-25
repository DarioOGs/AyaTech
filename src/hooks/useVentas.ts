import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { Venta } from "../types";

export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);

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
      }
    );
    return unsub;
  }, []);

  return { ventas, cargando };
}
