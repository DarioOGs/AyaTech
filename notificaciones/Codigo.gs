/**
 * Mailer gratuito para AyaTech · Alevinos Nueva Vida el Deseo.
 *
 * Recibe un aviso desde la app web (nuevo pedido, o pedido confirmado/
 * cancelado) y envía el correo real usando la cuenta de Google desde la
 * que se despliega este script (MailApp es gratis, sin tarjeta, con un
 * límite generoso de ~100 correos/día en cuentas Gmail normales).
 *
 * Ver notificaciones/README.md para las instrucciones de despliegue.
 */

// Cambia esto por el correo (o varios, separados por coma) donde el
// administrador quiere recibir el aviso de cada pedido nuevo.
const CORREOS_ADMIN = "dariocuello931@gmail.com";

function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);

    if (datos.tipo === "nuevo_pedido") {
      MailApp.sendEmail({
        to: CORREOS_ADMIN,
        subject: datos.asunto,
        body: datos.mensaje,
      });
    } else if (datos.tipo === "resultado_pedido" && datos.para) {
      MailApp.sendEmail({
        to: datos.para,
        subject: datos.asunto,
        body: datos.mensaje,
      });
    }

    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err);
  }
}
