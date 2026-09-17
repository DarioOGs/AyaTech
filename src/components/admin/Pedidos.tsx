import { addDoc, collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { usePedidos } from "../../hooks/usePedidos";
import { folioDe, kg, money } from "../../utils/format";

export default function Pedidos() {
  const { pedidos, cargando } = usePedidos("pendiente");
  const { usuario } = useAuth();
  const [procesando, setProcesando] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  async function confirmar(pedidoId: string) {
    setProcesando(pedidoId);
    setErrores((e) => ({ ...e, [pedidoId]: "" }));
    try {
      await runTransaction(db, async (tx) => {
        const pedidoRef = doc(db, "pedidos", pedidoId);
        const pedidoSnap = await tx.get(pedidoRef);
        if (!pedidoSnap.exists()) throw new Error("El pedido ya no existe.");
        const pedido = pedidoSnap.data();

        const especieRef = doc(db, "especies", pedido.especieId);
        const especieSnap = await tx.get(especieRef);
        if (!especieSnap.exists()) throw new Error("La especie ya no existe.");
        const especie = especieSnap.data();

        if (especie.kilosDisponibles < pedido.kilosSolicitados) {
          throw new Error("Ya no hay suficiente disponibilidad para confirmar este pedido.");
        }

        tx.update(especieRef, { kilosDisponibles: especie.kilosDisponibles - pedido.kilosSolicitados });
        tx.update(pedidoRef, { estado: "confirmado", fechaActualizacion: serverTimestamp() });
      });

      await addDoc(collection(db, "auditoria"), {
        tipo: "venta",
        descripcion: `Venta registrada — folio ${folioDe(pedidoId)}`,
        usuarioNombre: usuario?.nombre ?? "Personal",
        fecha: serverTimestamp(),
      });
    } catch (err) {
      setErrores((e) => ({ ...e, [pedidoId]: (err as Error).message }));
    } finally {
      setProcesando(null);
    }
  }

  async function cancelar(pedidoId: string) {
    const motivo = window.prompt("¿Por qué se cancela este pedido? (opcional)") ?? "";
    setProcesando(pedidoId);
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      await runTransaction(db, async (tx) => {
        tx.update(pedidoRef, {
          estado: "cancelado",
          motivoCancelacion: motivo,
          fechaActualizacion: serverTimestamp(),
        });
      });
      await addDoc(collection(db, "auditoria"), {
        tipo: "cancelacion",
        descripcion: `Venta cancelada — folio ${folioDe(pedidoId)}${motivo ? " — " + motivo : ""}`,
        usuarioNombre: usuario?.nombre ?? "Personal",
        fecha: serverTimestamp(),
      });
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div>
      <h2>Pedidos</h2>
      <div className="panel-sub">
        Confirma un pedido para convertirlo en venta, o cancélalo si el cliente no se presenta.
      </div>

      {cargando && <p className="caption-note">Cargando pedidos...</p>}
      {!cargando && pedidos.length === 0 && (
        <p className="caption-note">No hay pedidos pendientes por ahora.</p>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Cliente</th>
              <th>Pedido</th>
              <th>Entrega</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>{folioDe(p.id)}</td>
                <td>
                  {p.clienteNombre}
                  <br />
                  <span className="caption-note">C.C. {p.clienteCedula}</span>
                </td>
                <td className="num">
                  {p.especieNombre}, {kg(p.kilosSolicitados)}
                </td>
                <td>{p.domicilio ? "Domicilio" : "Recoge en finca"}</td>
                <td className="num">{money(p.valorTotal)}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="btn btn-primary btn-sm" disabled={procesando === p.id} onClick={() => confirmar(p.id)}>
                      Confirmar
                    </button>
                    <button className="btn btn-danger-line btn-sm" disabled={procesando === p.id} onClick={() => cancelar(p.id)}>
                      Cancelar
                    </button>
                  </div>
                  {errores[p.id] && <div className="field error">{errores[p.id]}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
