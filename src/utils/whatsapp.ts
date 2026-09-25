import { kg, money } from "./format";

export function linkReporteWhatsApp(datos: { periodo: string; ventas: number; kilos: number }): string {
  return "https://wa.me/?text=" + encodeURIComponent(textoReporte(datos));
}

export function textoReporte(datos: { periodo: string; ventas: number; kilos: number }): string {
  return [
    `Reporte ${datos.periodo} — Finca Nueva Vida el Deseo`,
    `Total vendido: ${money(datos.ventas)}`,
    `Kilos vendidos: ${kg(datos.kilos)}`,
  ].join("\n");
}
