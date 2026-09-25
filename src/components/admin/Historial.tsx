import { useMemo, useState } from "react";
import { usePedidos } from "../../hooks/usePedidos";
import { fechaCorta, folioDe, kg, money } from "../../utils/format";
import Icon from "../Icon";

function porFechaDesc<T extends { fechaActualizacion: { toMillis: () => number } | null }>(lista: T[]): T[] {
  return [...lista].sort((a, b) => (b.fechaActualizacion?.toMillis() ?? 0) - (a.fechaActualizacion?.toMillis() ?? 0));
}

export default function Historial() {
  const { pedidos: confirmados, cargando } = usePedidos("confirmado");
  const { pedidos: cancelados } = usePedidos("cancelado");
  const [verCanceladas, setVerCanceladas] = useState(false);

  const ventas = useMemo(() => porFechaDesc(confirmados), [confirmados]);
  const canceladas = useMemo(() => porFechaDesc(cancelados), [cancelados]);

  const totalKilos = ventas.reduce((s, p) => s + p.kilosSolicitados, 0);

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Historial de ventas</h2>
          <div className="panel-sub">
            Pedidos confirmados, listos para saber cuánto despachar. Total pendiente por entregar:{" "}
            <strong className="num">{kg(totalKilos)}</strong>.
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setVerCanceladas(true)}>
          <Icon name="xcircle" size={14} />
          Ver canceladas ({canceladas.length})
        </button>
      </div>

      {cargando && <p className="caption-note">Cargando historial...</p>}
      {!cargando && ventas.length === 0 && <p className="caption-note">Todavía no hay ventas confirmadas.</p>}

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
            </tr>
          </thead>
          <tbody>
            {ventas.map((p) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {verCanceladas && (
        <div className="modal-overlay" onClick={() => setVerCanceladas(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head">
              <h3 style={{ margin: 0 }}>Ventas canceladas</h3>
              <button className="icon-btn" onClick={() => setVerCanceladas(false)}>
                <Icon name="xcircle" size={16} />
              </button>
            </div>
            {canceladas.length === 0 && <p className="caption-note">No hay pedidos cancelados.</p>}
            <div className="log-list">
              {canceladas.map((p) => (
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
