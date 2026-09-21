import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { useConfiguracion } from "../../hooks/useConfiguracion";
import { money } from "../../utils/format";

export default function Configuracion() {
  const { config, cargando } = useConfiguracion();
  const { usuario } = useAuth();
  const [valor, setValor] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (!cargando) setValor(String(config.costoDomicilio));
  }, [cargando, config.costoDomicilio]);

  async function guardar() {
    const nuevo = parseFloat(valor);
    if (isNaN(nuevo) || nuevo < 0) return;
    setGuardando(true);
    try {
      await setDoc(doc(db, "configuracion", "general"), { costoDomicilio: nuevo }, { merge: true });
      await addDoc(collection(db, "auditoria"), {
        tipo: "config",
        descripcion: `Costo de domicilio actualizado a ${money(nuevo)}`,
        usuarioNombre: usuario?.nombre ?? "Administrador",
        fecha: serverTimestamp(),
      });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2200);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <h2>Configuración</h2>
      <div className="panel-sub">
        Ajustes generales de la tienda que se pueden cambiar sin tocar el código ni volver a
        publicar la app.
      </div>

      <div className="inline-form" style={{ gridTemplateColumns: "1fr", maxWidth: 340 }}>
        <div className="field">
          <label>Costo del domicilio</label>
          <input type="number" min="0" value={valor} onChange={(e) => setValor(e.target.value)} />
          <div className="hint">
            Se suma automáticamente al total del pedido cuando el cliente elige domicilio.
            Actualmente: <strong>{money(config.costoDomicilio)}</strong>.
          </div>
        </div>
        <div className="full">
          <button className="btn btn-primary btn-sm" onClick={guardar} disabled={guardando}>
            {guardado ? "Guardado ✓" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
