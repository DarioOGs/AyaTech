import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useVentas } from "../../hooks/useVentas";
import { haceNDias, inicioDelDia, inicioDelMes, inicioDeSemana } from "../../utils/dates";
import { kg, money } from "../../utils/format";
import { colorDeEspecie } from "../../utils/colors";
import { descargarReportePdf } from "../../utils/pdf";
import EspecieThumb from "../EspecieThumb";
import Icon from "../Icon";

type Rango = "hoy" | "semana" | "mes" | "todo";

const TITULOS: Record<Rango, string> = {
  hoy: "Hoy",
  semana: "Esta semana",
  mes: "Este mes",
  todo: "Histórico completo",
};

export default function Reportes() {
  const { ventas } = useVentas();
  const { usuario } = useAuth();
  const [rango, setRango] = useState<Rango>("semana");

  const desde = useMemo(() => {
    if (rango === "hoy") return inicioDelDia();
    if (rango === "semana") return inicioDeSemana();
    if (rango === "mes") return inicioDelMes();
    return haceNDias(3650);
  }, [rango]);

  const ventasFiltradas = ventas.filter((v) => v.fecha && v.fecha.toDate() >= desde);

  const totalVentas = ventasFiltradas.reduce((s, v) => s + v.valorTotal, 0);
  const totalKilos = ventasFiltradas.reduce((s, v) => s + v.kilos, 0);

  const porEspecie = useMemo(() => {
    const mapa = new Map<string, { kilos: number; ingresos: number }>();
    for (const v of ventasFiltradas) {
      const actual = mapa.get(v.especieNombre) ?? { kilos: 0, ingresos: 0 };
      actual.kilos += v.kilos;
      actual.ingresos += v.valorTotal;
      mapa.set(v.especieNombre, actual);
    }
    return Array.from(mapa.entries());
  }, [ventasFiltradas]);

  function descargarPdf() {
    descargarReportePdf({
      periodoTitulo: TITULOS[rango],
      generadoPor: usuario?.nombre ?? "Personal de la finca",
      ventas: totalVentas,
      kilos: totalKilos,
      porEspecie,
    });
  }

  return (
    <div>
      <h2>Reportes</h2>
      <div className="panel-sub">Cuánto se vendió por especie y en total, listo para descargar en PDF.</div>

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
              <div className="lbl">Total vendido</div>
              <div className="val num" style={{ color: "var(--leaf)" }}>
                {money(totalVentas)}
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
                    <td className="cell-species" style={{ ["--fish-color" as string]: colorDeEspecie(nombre) }}>
                      <EspecieThumb nombre={nombre} />
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
        </div>
      </div>
    </div>
  );
}
