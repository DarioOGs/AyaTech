import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import type { Configuracion } from "../types";

const VALORES_POR_DEFECTO: Configuracion = { costoDomicilio: 5000 };

export function useConfiguracion() {
  const [config, setConfig] = useState<Configuracion>(VALORES_POR_DEFECTO);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "configuracion", "general"),
      (snap) => {
        setConfig(snap.exists() ? { ...VALORES_POR_DEFECTO, ...(snap.data() as Configuracion) } : VALORES_POR_DEFECTO);
        setCargando(false);
      },
      () => setCargando(false)
    );
    return unsub;
  }, []);

  return { config, cargando };
}
