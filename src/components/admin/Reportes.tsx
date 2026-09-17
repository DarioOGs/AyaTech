import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGastos } from "../../hooks/useGastos";
import { usePedidos } from "../../hooks/usePedidos";
import { haceNDias, inicioDelDia, inicioDelMes, inicioDeSemana } from "../../utils/dates";
import { kg, money } from "../../utils/format";
import { descargarReportePdf } from "../../utils/pdf";
import { linkReporteWhatsApp, textoReporte } from "../../utils/whatsapp";
import Icon from "../Icon";

type Rango = "hoy" | "semana" | "mes" | "todo";

const ETIQUETAS: Record<Rango, string> = {
  hoy: "de hoy",
  semana: "de esta semana",
  mes: "de este mes",
  todo: "general",
};

const TITULOS: Record<Rango, string> = {
  hoy: "Hoy",
  semana: "Esta semana",
  mes: "Este mes",
  todo: "Histórico completo",
};

export default function Reportes() {
  const { pedidos } = usePedidos("confirmado");
  const { gastos } = useGastos();
  const { usuario } = useAuth();
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

  function descargarPdf() {
    descargarReportePdf({
      periodoTitulo: TITULOS[rango],
      generadoPor: usuario?.nombre ?? "Personal de la finca",
      ventas: totalVentas,
      gastos: totalGastos,
      kilos: totalKilos,
      porEspecie,
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
          <h3>Descargar reporte</h3>
          <p>Genera un PDF con el resumen y el detalle por especie, listo para adjuntar donde quieras.</p>
          <button className="btn btn-primary" onClick={descargarPdf}>
            <Icon name="download" size={16} />
            Descargar PDF
          </button>

          <h3 style={{ marginTop: 18 }}>Enviar reporte</h3>
          <p>
            Un toque abre WhatsApp con el mensaje ya escrito — tú eliges a quién enviárselo y
            presionas enviar allá dentro. Es gratis, sin contratar ninguna API.
          </p>
          <a
            className="btn btn-outline"
            href={linkReporteWhatsApp(datosReporte)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="send" size={16} />
            Abrir mensaje de WhatsApp
          </a>
          <button className="btn btn-outline" onClick={copiarReporte}>
            <Icon name={copiado ? "check" : "copy"} size={16} />
            {copiado ? "Reporte copiado" : "Copiar texto para correo"}
          </button>
          <p className="caption-note">
            El botón de WhatsApp y "Copiar texto" solo comparten las cifras en texto (WhatsApp no
            permite adjuntar archivos desde un enlace); si quieres mandar el PDF, descárgalo
            arriba y adjúntalo tú mismo en el chat o el correo.
          </p>
        </div>
      </div>
    </div>
  );
}
