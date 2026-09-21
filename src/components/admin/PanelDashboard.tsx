import { useMemo } from "react";
import { useAuditoria } from "../../hooks/useAuditoria";
import { useEspecies } from "../../hooks/useEspecies";
import { useGastos } from "../../hooks/useGastos";
import { usePedidos } from "../../hooks/usePedidos";
import { inicioDelDia, inicioDelMes } from "../../utils/dates";
import { kg, money, tiempoRelativo } from "../../utils/format";
import Icon, { type IconName } from "../Icon";

const ICONO_TIPO: Record<string, { icon: IconName; clase: string }> = {
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

export default function PanelDashboard() {
  const { especies } = useEspecies(true);
  const { pedidos } = usePedidos();
  const { gastos } = useGastos();
  const { entradas } = useAuditoria(6);

  const kilosDisponibles = useMemo(
    () => especies.reduce((sum, e) => sum + e.kilosDisponibles, 0),
    [especies]
  );
  const pendientes = useMemo(() => pedidos.filter((p) => p.estado === "pendiente"), [pedidos]);
  const confirmados = useMemo(() => pedidos.filter((p) => p.estado === "confirmado"), [pedidos]);

  const hoy = inicioDelDia();
  const inicioMes = inicioDelMes();

  const ventasHoy = useMemo(
    () =>
      confirmados
        .filter((p) => p.fechaActualizacion && p.fechaActualizacion.toDate() >= hoy)
        .reduce((s, p) => s + p.valorTotal, 0),
    [confirmados]
  );

  const ventasMes = useMemo(
    () =>
      confirmados
        .filter((p) => p.fechaActualizacion && p.fechaActualizacion.toDate() >= inicioMes)
        .reduce((s, p) => s + p.valorTotal, 0),
    [confirmados]
  );

  const gastosMes = useMemo(
    () =>
      gastos
        .filter((g) => g.fecha && g.fecha.toDate() >= inicioMes)
        .reduce((s, g) => s + g.valor, 0),
    [gastos]
  );

  const gananciaNeta = ventasMes - gastosMes;

  const datosGrafico = useMemo(() => {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const arr: { etiqueta: string; valor: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const inicio = inicioDelDia(d);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 1);
      const total = confirmados
        .filter((p) => p.fechaActualizacion)
        .filter((p) => {
          const t = p.fechaActualizacion!.toDate();
          return t >= inicio && t < fin;
        })
        .reduce((s, p) => s + p.valorTotal, 0);
      arr.push({ etiqueta: i === 0 ? "Hoy" : dias[d.getDay()], valor: total });
    }
    return arr;
  }, [confirmados]);

  const max = Math.max(1, ...datosGrafico.map((d) => d.valor));

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Resumen de la finca</h2>
          <div className="panel-sub">
            {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="icon-badge water">
            <Icon name="box" size={16} />
          </div>
          <div className="lbl">Kilos disponibles</div>
          <div className="val num">{kg(kilosDisponibles)}</div>
          <div className="delta">{especies.length} especies activas</div>
        </div>
        <div className="stat-tile">
          <div className="icon-badge amber">
            <Icon name="list" size={16} />
          </div>
          <div className="lbl">Pedidos pendientes</div>
          <div className="val num">{pendientes.length}</div>
          <div className="delta">esperan confirmación</div>
        </div>
        <div className="stat-tile">
          <div className="icon-badge leaf">
            <Icon name="checkcircle" size={16} />
          </div>
          <div className="lbl">Ventas de hoy</div>
          <div className="val num">{money(ventasHoy)}</div>
          <div className="delta">ventas confirmadas hoy</div>
        </div>
        <div className="stat-tile">
          <div className="icon-badge clay">
            <Icon name="wallet" size={16} />
          </div>
          <div className="lbl">Ganancia neta del mes</div>
          <div className="val num">{money(gananciaNeta)}</div>
          <div className="delta">ventas − gastos del mes</div>
        </div>
      </div>

      <div className="chart-card">
        <h3>Ventas de los últimos 7 días</h3>
        <svg viewBox="0 0 320 130" style={{ width: "100%", height: "auto", maxWidth: 520, overflow: "visible" }}>
          {[1, 2, 3].map((i) => (
            <line key={i} x1={8} y1={10 + (98 * i) / 3} x2={312} y2={10 + (98 * i) / 3} stroke="var(--grid-line)" strokeWidth={1} />
          ))}
          {datosGrafico.map((d, i) => {
            const bw = (320 - 16) / datosGrafico.length;
            const bh = (d.valor / max) * 92;
            const x = 8 + i * bw + bw * 0.22;
            const bw2 = bw * 0.56;
            const y = 108 - bh;
            const esUltimo = i === datosGrafico.length - 1;
            return (
              <g key={i}>
                <rect x={x} y={y} width={bw2} height={Math.max(bh, 1)} rx={4} fill={esUltimo ? "var(--water)" : "var(--water-mid)"} opacity={esUltimo ? 1 : 0.75} />
                <text x={x + bw2 / 2} y={122} textAnchor="middle" fontSize={9} fill="var(--ink-faint)">
                  {d.etiqueta}
                </text>
                {esUltimo && (
                  <text x={x + bw2 / 2} y={y - 6} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--water)">
                    {money(d.valor)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <h3 style={{ fontSize: ".95rem", marginBottom: 10 }}>Actividad reciente</h3>
      <div className="log-list">
        {entradas.length === 0 && <p className="caption-note">Todavía no hay movimientos registrados.</p>}
        {entradas.map((e) => {
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
