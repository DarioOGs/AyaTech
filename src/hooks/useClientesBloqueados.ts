import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { ClienteBloqueado } from "../types";

export function useClientesBloqueados() {
  const [clientes, setClientes] = useState<ClienteBloqueado[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "clientesBloqueados"), orderBy("fechaBloqueo", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setClientes(snap.docs.map((d) => ({ cedula: d.id, ...d.data() } as ClienteBloqueado)));
        setCargando(false);
      },
      (err) => {
        console.error("Error leyendo clientes bloqueados:", err);
        setCargando(false);
      }
    );
    return unsub;
  }, []);

  return { clientes, cargando };
}
