import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { usePedidos } from "../../hooks/usePedidos";
import { fechaCorta, folioDe, kg, money } from "../../utils/format";
import Icon from "../Icon";

function porFechaDesc<T extends { fechaActualizacion: { toMillis: () => number } | null }>(lista: T[]): T[] {
  return [...lista].sort((a, b) => (b.fechaActualizacion?.toMillis() ?? 0) - (a.fechaActualizacion?.toMillis() ?? 0));
}

export default function EntregasPendientes() {
  const { pedidos: confirmados, cargando } = usePedidos("confirmado");
  const { pedidos: cancelados } = usePedidos("cancelado");
  const { usuario } = useAuth();
  const [verCanceladas, setVerCanceladas] = useState(false);
  const [procesando, setProcesando] = useState<string | null>(null);

  const pendientes = useMemo(() => porFechaDesc(confirmados), [confirmados]);
  const canceladasOrdenadas = useMemo(() => porFechaDesc(cancelados), [cancelados]);

  const totalKilos = pendientes.reduce((s, p) => s + p.kilosSolicitados, 0);

  async function marcarEntregado(pedidoId: string, especieNombre: string, kilos: number) {
    const confirmado = window.confirm(
      "¿Ya se le entregó este pedido al cliente? Se elimina de esta lista para no acumular datos de contacto. Las cifras de la venta ya quedaron guardadas en Reportes."
    );
    if (!confirmado) return;

    setProcesando(pedidoId);
    try {
      await deleteDoc(doc(db, "pedidos", pedidoId));
      await addDoc(collection(db, "auditoria"), {
        tipo: "entrega",
        descripcion: `Pedido entregado — ${especieNombre}, ${kg(kilos)}`,
        usuarioNombre: usuario?.nombre ?? "Personal",
        fecha: serverTimestamp(),
      });
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Entregas pendientes</h2>
          <div className="panel-sub">
            Pedidos ya confirmados, listos para despachar. Total por entregar:{" "}
            <strong className="num">{kg(totalKilos)}</strong>. Al marcar uno como entregado se
            borra de aquí — las cifras de venta quedan guardadas en Reportes.
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setVerCanceladas(true)}>
          <Icon name="xcircle" size={14} />
          Ver canceladas ({canceladasOrdenadas.length})
        </button>
      </div>

      {cargando && <p className="caption-note">Cargando...</p>}
      {!cargando && pendientes.length === 0 && <p className="caption-note">No hay entregas pendientes por ahora.</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Cliente</th>
              <th>Pedido</th>
              <th>Entrega</th>
              <th>Total</th>
              <th>Confirmado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pendientes.map((p) => (
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
                <td>{fechaCorta(p.fechaActualizacion)}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={procesando === p.id}
                    onClick={() => marcarEntregado(p.id, p.especieNombre, p.kilosSolicitados)}
                  >
                    Marcar entregado
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {verCanceladas && (
        <div className="modal-overlay" onClick={() => setVerCanceladas(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <h3 style={{ margin: 0 }}>Pedidos cancelados</h3>
              <button className="icon-btn" onClick={() => setVerCanceladas(false)}>
                <Icon name="xcircle" size={16} />
              </button>
            </div>
            {canceladasOrdenadas.length === 0 && <p className="caption-note">No hay pedidos cancelados.</p>}
            <div className="log-list">
              {canceladasOrdenadas.map((p) => (
                <div className="log-item" key={p.id}>
                  <div className="log-ic danger">
                    <Icon name="xcircle" size={16} />
                  </div>
                  <div className="log-body">
                    <div className="log-title">
                      {folioDe(p.id)} — {p.clienteNombre} — {p.especieNombre}, {kg(p.kilosSolicitados)}
                    </div>
                    <div className="log-meta">
                      {p.motivoCancelacion ? `Motivo: ${p.motivoCancelacion}` : "Sin motivo registrado"} ·{" "}
                      {fechaCorta(p.fechaActualizacion)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
