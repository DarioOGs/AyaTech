import { useState } from "react";
import { useAuditoria } from "../../hooks/useAuditoria";
import { tiempoRelativo } from "../../utils/format";
import Icon, { type IconName } from "../Icon";
import type { TipoAuditoria } from "../../types";

type Filtro = "todas" | "ventas" | "inventario" | "clientes";

const GRUPOS: Record<Filtro, TipoAuditoria[] | null> = {
  todas: null,
  ventas: ["venta", "cancelacion"],
  inventario: ["adicion_kg", "reduccion_kg", "nueva_especie", "cambio_precio", "config"],
  clientes: ["bloqueo", "desbloqueo"],
};

const ICONO_TIPO: Record<TipoAuditoria, { icon: IconName; clase: string }> = {
  venta: { icon: "checkcircle", clase: "leaf" },
  cancelacion: { icon: "xcircle", clase: "danger" },
  adicion_kg: { icon: "plus", clase: "water" },
  reduccion_kg: { icon: "minus", clase: "amber" },
  nueva_especie: { icon: "box", clase: "water" },
  cambio_precio: { icon: "tag", clase: "amber" },
  bloqueo: { icon: "ban", clase: "danger" },
  desbloqueo: { icon: "check", clase: "leaf" },
  config: { icon: "gear", clase: "water" },
};

export default function Historial() {
  const { entradas, cargando } = useAuditoria(150);
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const visibles = entradas.filter((e) => {
    const grupo = GRUPOS[filtro];
    return grupo === null || grupo.includes(e.tipo);
  });

  return (
    <div>
      <h2>Historial y auditoría</h2>
      <div className="panel-sub">
        Cada venta, cancelación o cambio de inventario queda registrado con fecha, hora y
        responsable.
      </div>

      <div className="chip-row">
        {(["todas", "ventas", "inventario", "clientes"] as Filtro[]).map((f) => (
          <button key={f} className={"filter-chip" + (filtro === f ? " active" : "")} onClick={() => setFiltro(f)}>
            {f === "todas" ? "Todas" : f === "ventas" ? "Ventas" : f === "inventario" ? "Inventario" : "Clientes"}
          </button>
        ))}
      </div>

      {cargando && <p className="caption-note">Cargando historial...</p>}
      {!cargando && visibles.length === 0 && <p className="caption-note">Todavía no hay movimientos en esta categoría.</p>}

      <div className="log-list">
        {visibles.map((e) => {
          const cfg = ICONO_TIPO[e.tipo] ?? { icon: "check" as IconName, clase: "water" };
          return (
            <div className="log-item" key={e.id}>
              <div className={"log-ic " + cfg.clase}>
                <Icon name={cfg.icon} size={16} />
              </div>
              <div className="log-body">
                <div className="log-title">{e.descripcion}</div>
                <div className="log-meta">
                  {e.usuarioNombre} · {tiempoRelativo(e.fecha)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
