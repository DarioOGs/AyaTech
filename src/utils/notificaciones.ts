import { kg, money } from "./format";

// Llama a un Google Apps Script (gratis, sin tarjeta) que envía los
// correos reales — ver /notificaciones/README.md para desplegarlo.
// Mientras VITE_NOTIFICACIONES_URL no esté configurada, estas funciones
// simplemente no hacen nada: nunca deben bloquear ni fallar el pedido.
function urlNotificaciones(): string | undefined {
  return import.meta.env.VITE_NOTIFICACIONES_URL || undefined;
}

function enviar(payload: unknown) {
  const url = urlNotificaciones();
  if (!url) return;
  // mode "no-cors" + texto plano evita el preflight que Apps Script no
  // maneja; es "dispara y olvida": no necesitamos leer la respuesta.
  fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  }).catch(() => {
    /* si falla el aviso, el pedido/la venta ya quedaron guardados igual */
  });
}

export function notificarNuevoPedido(datos: {
  folio: string;
  clienteNombre: string;
  clienteTelefono: string;
  especieNombre: string;
  kilos: number;
  domicilio: boolean;
  total: number;
}) {
  enviar({
    tipo: "nuevo_pedido",
    asunto: `Nuevo pedido ${datos.folio} — ${datos.especieNombre}`,
    mensaje:
      `Llegó un pedido nuevo por la página:\n\n` +
      `Folio: ${datos.folio}\n` +
      `Cliente: ${datos.clienteNombre} (${datos.clienteTelefono})\n` +
      `Pedido: ${datos.especieNombre}, ${kg(datos.kilos)}\n` +
      `Entrega: ${datos.domicilio ? "Domicilio" : "Recoge en la finca"}\n` +
      `Total: ${money(datos.total)}\n\n` +
      `Entra al panel interno → Pedidos para confirmarlo o cancelarlo.`,
  });
}

export function notificarResultadoPedido(
  estado: "confirmado" | "cancelado",
  datos: { folio: string; clienteCorreo: string; especieNombre: string; kilos: number; total: number }
) {
  if (!datos.clienteCorreo.trim()) return;
  const titulo = estado === "confirmado" ? "¡Tu pedido fue confirmado!" : "Tu pedido fue cancelado";
  const cuerpo =
    estado === "confirmado"
      ? `Tu pedido ${datos.folio} (${datos.especieNombre}, ${kg(datos.kilos)}, ${money(
          datos.total
        )}) fue confirmado por la finca. Ya puedes acercarte a recoger o esperar tu domicilio.`
      : `Tu pedido ${datos.folio} (${datos.especieNombre}, ${kg(datos.kilos)}) fue cancelado. Si tienes dudas, comunícate con la finca.`;

  enviar({
    tipo: "resultado_pedido",
    para: datos.clienteCorreo.trim(),
    asunto: `${titulo} — Finca Nueva Vida el Deseo`,
    mensaje: cuerpo,
  });
}
