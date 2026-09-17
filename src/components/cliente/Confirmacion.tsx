import type { Pedido } from "../../types";
import { folioDe, kg, money } from "../../utils/format";
import Icon from "../Icon";

export default function Confirmacion({
  folioId,
  pedido,
  onNuevoPedido,
}: {
  folioId: string;
  pedido: Pedido;
  onNuevoPedido: () => void;
}) {
  return (
    <div className="confirm-wrap">
      <div className="confirm-icon">
        <Icon name="check" size={28} />
      </div>
      <h2 style={{ margin: "0 0 2px" }}>¡Pedido registrado!</h2>
      <div className="folio">{folioDe(folioId)}</div>

      <div className="confirm-note">
        {pedido.especieNombre} · {kg(pedido.kilosSolicitados)} · Total {money(pedido.valorTotal)}
      </div>

      <div className="confirm-note">
        {pedido.domicilio
          ? "Tu pedido llegará a domicilio. Ten el pago listo cuando llegue el encargado."
          : "Preséntate en la finca con tu cédula para recoger y pagar tu pedido."}
      </div>

      <div className="confirm-note" style={{ background: "var(--leaf-bg)", borderColor: "transparent", color: "var(--leaf)" }}>
        Si en este momento no tienes señal, tranquilo: tu pedido queda guardado en tu celular y se
        envía solo a la finca apenas vuelva la conexión.
      </div>

      <button className="btn btn-outline" style={{ width: "100%" }} onClick={onNuevoPedido}>
        Hacer otro pedido
      </button>
    </div>
  );
}
