import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { kg, money } from "./format";

interface DatosReportePdf {
  periodoTitulo: string;
  generadoPor: string;
  ventas: number;
  gastos: number;
  kilos: number;
  porEspecie: [string, { kilos: number; ingresos: number }][];
}

export function descargarReportePdf(datos: DatosReportePdf) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ganancia = datos.ventas - datos.gastos;
  const ahora = new Date();

  doc.setFillColor(11, 79, 92);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Finca Nueva Vida el Deseo", 14, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Reporte de ventas y gastos — ${datos.periodoTitulo}`, 14, 22);

  doc.setTextColor(90, 90, 90);
  doc.setFontSize(9);
  doc.text(
    `Generado el ${ahora.toLocaleDateString("es-CO")} a las ` +
      `${ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} por ${datos.generadoPor}`,
    14,
    38
  );

  autoTable(doc, {
    startY: 44,
    theme: "plain",
    styles: { fontSize: 11, cellPadding: 2 },
    body: [
      ["Ventas totales", money(datos.ventas)],
      ["Gastos", money(datos.gastos)],
      ["Ganancia neta", money(ganancia)],
      ["Kilos vendidos", kg(datos.kilos)],
    ],
    columnStyles: {
      0: { fontStyle: "bold", textColor: [78, 100, 105] },
      1: { halign: "right", fontStyle: "bold" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  doc.setTextColor(11, 79, 92);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Ventas por especie", 14, finalY);

  autoTable(doc, {
    startY: finalY + 4,
    head: [["Especie", "Kg vendidos", "Ingresos"]],
    body: datos.porEspecie.length
      ? datos.porEspecie.map(([nombre, d]) => [nombre, kg(d.kilos), money(d.ingresos)])
      : [["Sin ventas registradas en este periodo", "", ""]],
    headStyles: { fillColor: [11, 79, 92], textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
  });

  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Generado automáticamente desde el panel interno de AyaTech · Alevinos Nueva Vida el Deseo",
    14,
    290
  );

  const nombreArchivo = `reporte-alevinos-${ahora.toISOString().slice(0, 10)}.pdf`;
  doc.save(nombreArchivo);
}
