import { kg, money } from "./format";

export function linkReporteWhatsApp(datos: {
  periodo: string;
  ventas: number;
  gastos: number;
  kilos: number;
}): string {
  const ganancia = datos.ventas - datos.gastos;
  const texto = [
    `Reporte ${datos.periodo} — Finca Nueva Vida el Deseo`,
    `Ventas totales: ${money(datos.ventas)}`,
    `Gastos: ${money(datos.gastos)}`,
    `Ganancia neta: ${money(ganancia)}`,
    `Kilos vendidos: ${kg(datos.kilos)}`,
  ].join("\n");
  return "https://wa.me/?text=" + encodeURIComponent(texto);
}

export function textoReporte(datos: {
  periodo: string;
  ventas: number;
  gastos: number;
  kilos: number;
}): string {
  const ganancia = datos.ventas - datos.gastos;
  return [
    `Reporte ${datos.periodo} — Finca Nueva Vida el Deseo`,
    `Ventas totales: ${money(datos.ventas)}`,
    `Gastos: ${money(datos.gastos)}`,
    `Ganancia neta: ${money(ganancia)}`,
    `Kilos vendidos: ${kg(datos.kilos)}`,
  ].join("\n");
}
