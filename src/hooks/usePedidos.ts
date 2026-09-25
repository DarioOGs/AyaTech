import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { EstadoPedido, Pedido } from "../types";

export function usePedidos(estado?: EstadoPedido) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const base = collection(db, "pedidos");
    const q = estado
      ? query(base, where("estado", "==", estado), orderBy("fechaCreacion", "desc"))
      : query(base, orderBy("fechaCreacion", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setPedidos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pedido)));
        setError("");
        setCargando(false);
      },
      (err) => {
        console.error("Error leyendo pedidos:", err);
        setError("No se pudieron cargar los pedidos. Reintentando...");
        setCargando(false);
        setTimeout(() => setIntento((n) => n + 1), 4000);
      }
    );
    return unsub;
  }, [estado, intento]);

  return { pedidos, cargando, error };
}
