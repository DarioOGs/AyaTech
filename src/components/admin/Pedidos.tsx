import { addDoc, collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { usePedidos } from "../../hooks/usePedidos";
import type { Pedido } from "../../types";
import { folioDe, kg, money } from "../../utils/format";
import { notificarResultadoPedido } from "../../utils/notificaciones";

export default function Pedidos() {
  const { pedidos, cargando, error: errorCarga } = usePedidos("pendiente");
  const { usuario } = useAuth();
  const [procesando, setProcesando] = useState<string | null>(null);
  const [procesados, setProcesados] = useState<Set<string>>(new Set());
  const [errores, setErrores] = useState<Record<string, string>>({});

  function marcarResuelto(pedidoId: string) {
    setProcesados((prev) => new Set(prev).add(pedidoId));
  }

  function yaNoEstaPendiente(mensaje: string) {
    return mensaje === "El pedido ya no existe." || mensaje.startsWith("Este pedido ya fue procesado");
  }

  async function confirmar(pedido: Pedido) {
    if (procesando) return;
    setProcesando(pedido.id);
    setErrores((e) => ({ ...e, [pedido.id]: "" }));
    try {
      await runTransaction(db, async (tx) => {
        const pedidoRef = doc(db, "pedidos", pedido.id);
        const pedidoSnap = await tx.get(pedidoRef);
        if (!pedidoSnap.exists()) throw new Error("El pedido ya no existe.");
        const datosPedido = pedidoSnap.data();

        if (datosPedido.estado !== "pendiente") {
          throw new Error("Este pedido ya fue procesado (por ti o por otro empleado).");
        }

        const especieRef = doc(db, "especies", datosPedido.especieId);
        const especieSnap = await tx.get(especieRef);
        if (!especieSnap.exists()) throw new Error("La especie ya no existe.");
        const especie = especieSnap.data();

        if (especie.kilosDisponibles < datosPedido.kilosSolicitados) {
          throw new Error("Ya no hay suficiente disponibilidad para confirmar este pedido.");
        }

        tx.update(especieRef, { kilosDisponibles: especie.kilosDisponibles - datosPedido.kilosSolicitados });
        tx.update(pedidoRef, { estado: "confirmado", fechaActualizacion: serverTimestamp() });
      });

      marcarResuelto(pedido.id);
      await addDoc(collection(db, "auditoria"), {
        tipo: "venta",
        descripcion: `Venta registrada — folio ${folioDe(pedido.id)}`,
        usuarioNombre: usuario?.nombre ?? "Personal",
        fecha: serverTimestamp(),
      });
      await addDoc(collection(db, "ventas"), {
        especieNombre: pedido.especieNombre,
        kilos: pedido.kilosSolicitados,
        precioPorKilo: pedido.precioPorKilo,
        valorTotal: pedido.valorTotal,
        domicilio: pedido.domicilio,
        fecha: serverTimestamp(),
      });
      notificarResultadoPedido("confirmado", {
        folio: folioDe(pedido.id),
        clienteCorreo: pedido.clienteCorreo,
        especieNombre: pedido.especieNombre,
        kilos: pedido.kilosSolicitados,
        total: pedido.valorTotal,
      });
    } catch (err) {
      const mensaje = (err as Error).message;
      setErrores((e) => ({ ...e, [pedido.id]: mensaje }));
      if (yaNoEstaPendiente(mensaje)) marcarResuelto(pedido.id);
    } finally {
      setProcesando(null);
    }
  }

  async function cancelar(pedido: Pedido) {
    if (procesando) return;
    const motivo = window.prompt("¿Por qué se cancela este pedido? (opcional)") ?? "";
    setProcesando(pedido.id);
    setErrores((e) => ({ ...e, [pedido.id]: "" }));
    try {
      await runTransaction(db, async (tx) => {
        const pedidoRef = doc(db, "pedidos", pedido.id);
        const pedidoSnap = await tx.get(pedidoRef);
        if (!pedidoSnap.exists()) throw new Error("El pedido ya no existe.");
        if (pedidoSnap.data().estado !== "pendiente") {
          throw new Error("Este pedido ya fue procesado (por ti o por otro empleado).");
        }
        tx.update(pedidoRef, {
          estado: "cancelado",
          motivoCancelacion: motivo,
          fechaActualizacion: serverTimestamp(),
        });
      });

      marcarResuelto(pedido.id);
      await addDoc(collection(db, "auditoria"), {
        tipo: "cancelacion",
        descripcion: `Venta cancelada — folio ${folioDe(pedido.id)}${motivo ? " — " + motivo : ""}`,
        usuarioNombre: usuario?.nombre ?? "Personal",
        fecha: serverTimestamp(),
      });
      notificarResultadoPedido("cancelado", {
        folio: folioDe(pedido.id),
        clienteCorreo: pedido.clienteCorreo,
        especieNombre: pedido.especieNombre,
        kilos: pedido.kilosSolicitados,
        total: pedido.valorTotal,
      });
    } catch (err) {
      const mensaje = (err as Error).message;
      setErrores((e) => ({ ...e, [pedido.id]: mensaje }));
      if (yaNoEstaPendiente(mensaje)) marcarResuelto(pedido.id);
    } finally {
      setProcesando(null);
    }
  }

  const visibles = pedidos.filter((p) => !procesados.has(p.id));

  return (
    <div>
      <h2>Pedidos</h2>
      <div className="panel-sub">
        Confirma un pedido para convertirlo en venta, o cancélalo si el cliente no se presenta.
      </div>

      {errorCarga && <p className="field error">{errorCarga}</p>}
      {cargando && <p className="caption-note">Cargando pedidos...</p>}
      {!cargando && visibles.length === 0 && (
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
            {visibles.map((p) => (
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
                    <button className="btn btn-primary btn-sm" disabled={procesando === p.id} onClick={() => confirmar(p)}>
                      Confirmar
                    </button>
                    <button className="btn btn-danger-line btn-sm" disabled={procesando === p.id} onClick={() => cancelar(p)}>
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
