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
