import type { Timestamp } from "firebase/firestore";

export function money(valor: number): string {
  return "$" + Math.round(valor).toLocaleString("es-CO");
}

export function kg(valor: number): string {
  return (
    valor.toLocaleString("es-CO", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " kg"
  );
}

export function folioDe(id: string): string {
  return "#PED-" + id.slice(-5).toUpperCase();
}

export function fechaCorta(fecha: Timestamp | null): string {
  if (!fecha) return "guardando...";
  return fecha.toDate().toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function tiempoRelativo(fecha: Timestamp | null): string {
  if (!fecha) return "enviando...";
  const diffMs = Date.now() - fecha.toDate().getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "justo ahora";
  if (min < 60) return `hace ${min} min`;
  const horas = Math.round(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} d`;
}
