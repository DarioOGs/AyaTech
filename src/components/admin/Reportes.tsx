import { useMemo, useState } from "react";
import { useGastos } from "../../hooks/useGastos";
import { usePedidos } from "../../hooks/usePedidos";
import { haceNDias, inicioDelDia, inicioDelMes, inicioDeSemana } from "../../utils/dates";
import { kg, money } from "../../utils/format";
import { linkReporteWhatsApp, textoReporte } from "../../utils/whatsapp";
import Icon from "../Icon";

type Rango = "hoy" | "semana" | "mes" | "todo";

const ETIQUETAS: Record<Rango, string> = {
  hoy: "de hoy",
  semana: "de esta semana",
  mes: "de este mes",
  todo: "general",
};

export default function Reportes() {
  const { pedidos } = usePedidos("confirmado");
  const { gastos } = useGastos();
  const [rango, setRango] = useState<Rango>("semana");
  const [copiado, setCopiado] = useState(false);

  const desde = useMemo(() => {
    if (rango === "hoy") return inicioDelDia();
    if (rango === "semana") return inicioDeSemana();
    if (rango === "mes") return inicioDelMes();
    return haceNDias(3650);
  }, [rango]);

  const ventasFiltradas = pedidos.filter((p) => p.fechaActualizacion && p.fechaActualizacion.toDate() >= desde);
  const gastosFiltrados = gastos.filter((g) => g.fecha && g.fecha.toDate() >= desde);

  const totalVentas = ventasFiltradas.reduce((s, p) => s + p.valorTotal, 0);
  const totalGastos = gastosFiltrados.reduce((s, g) => s + g.valor, 0);
  const totalKilos = ventasFiltradas.reduce((s, p) => s + p.kilosSolicitados, 0);
  const gananciaNeta = totalVentas - totalGastos;

  const porEspecie = useMemo(() => {
    const mapa = new Map<string, { kilos: number; ingresos: number }>();
    for (const p of ventasFiltradas) {
      const actual = mapa.get(p.especieNombre) ?? { kilos: 0, ingresos: 0 };
      actual.kilos += p.kilosSolicitados;
      actual.ingresos += p.valorTotal;
      mapa.set(p.especieNombre, actual);
    }
    return Array.from(mapa.entries());
  }, [ventasFiltradas]);

  const datosReporte = { periodo: ETIQUETAS[rango], ventas: totalVentas, gastos: totalGastos, kilos: totalKilos };

  function copiarReporte() {
    navigator.clipboard.writeText(textoReporte(datosReporte)).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    });
  }

  return (
    <div>
      <h2>Reportes</h2>
      <div className="panel-sub">Ventas, ganancias y gastos listos para revisar o enviar por WhatsApp.</div>

      <div className="chip-row">
        {(["hoy", "semana", "mes", "todo"] as Rango[]).map((r) => (
          <button key={r} className={"filter-chip" + (rango === r ? " active" : "")} onClick={() => setRango(r)}>
            {r === "hoy" ? "Hoy" : r === "semana" ? "Esta semana" : r === "mes" ? "Este mes" : "Todo"}
          </button>
        ))}
      </div>

      <div className="report-grid">
        <div>
          <div className="stat-grid" style={{ gridTemplateColumns: "repeat(2,1fr)", marginBottom: 16 }}>
            <div className="stat-tile">
              <div className="lbl">Ventas totales</div>
              <div className="val num">{money(totalVentas)}</div>
            </div>
            <div className="stat-tile">
              <div className="lbl">Gastos</div>
              <div className="val num">{money(totalGastos)}</div>
            </div>
            <div className="stat-tile">
              <div className="lbl">Ganancia neta</div>
              <div className="val num" style={{ color: "var(--leaf)" }}>
                {money(gananciaNeta)}
              </div>
            </div>
            <div className="stat-tile">
              <div className="lbl">Kilos vendidos</div>
              <div className="val num">{kg(totalKilos)}</div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Especie</th>
                  <th>Kg vendidos</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {porEspecie.length === 0 && (
                  <tr>
                    <td colSpan={3} className="caption-note">
                      No hay ventas confirmadas en este rango.
                    </td>
                  </tr>
                )}
                {porEspecie.map(([nombre, datos]) => (
                  <tr key={nombre}>
                    <td className="cell-species">
                      <span className="mini-fish">
                        <Icon name="fish" size={15} />
                      </span>
                      {nombre}
                    </td>
                    <td className="num">{kg(datos.kilos)}</td>
                    <td className="num">{money(datos.ingresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="send-card">
          <h3>Enviar reporte</h3>
          <p>Un toque arma el mensaje con estas cifras — gratis, sin contratar ninguna API.</p>
          <a
            className="btn btn-primary"
            href={linkReporteWhatsApp(datosReporte)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="send" size={16} />
            Enviar por WhatsApp
          </a>
          <button className="btn btn-outline" onClick={copiarReporte}>
            <Icon name={copiado ? "check" : "copy"} size={16} />
            {copiado ? "Reporte copiado" : "Copiar para correo"}
          </button>
          <p className="caption-note">
            "Copiar para correo" pone el texto del reporte en el portapapeles para que lo pegues
            en un correo o donde prefieras.
          </p>
        </div>
      </div>
    </div>
  );
}
