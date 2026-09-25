import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { db } from "../../firebase/config";
import { useConfiguracion } from "../../hooks/useConfiguracion";
import type { Especie, Pedido } from "../../types";
import { folioDe, money } from "../../utils/format";
import { notificarNuevoPedido } from "../../utils/notificaciones";
import Icon from "../Icon";

const SOLO_LETRAS = /[^A-Za-zÀ-ÿñÑ\s]/g;

export default function FormularioPedido({
  especie,
  onVolver,
  onConfirmado,
}: {
  especie: Especie;
  onVolver: () => void;
  onConfirmado: (folioId: string, pedido: Pedido) => void;
}) {
  const [kilos, setKilos] = useState(5);
  const [domicilio, setDomicilio] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const { config: configuracion } = useConfiguracion();

  const subtotal = kilos * especie.precioPorKilo;
  const costoDomicilio = domicilio ? configuracion.costoDomicilio : 0;
  const total = subtotal + costoDomicilio;

  function cambiarKg(delta: number) {
    setKilos((k) => Math.max(0.5, Math.round((k + delta) * 10) / 10));
  }

  function escribirKg(valor: string) {
    const n = parseFloat(valor.replace(",", "."));
    setKilos(Number.isFinite(n) && n > 0 ? n : 0);
  }

  async function confirmar() {
    setError("");
    if (!kilos || kilos <= 0) return setError("Escribe cuántos kilos deseas.");
    if (!nombre.trim() || nombre.trim().length < 3) return setError("Escribe tu nombre completo.");
    if (!/^\d{6,10}$/.test(cedula.trim())) return setError("Escribe un número de cédula válido.");
    if (!telefono.trim()) return setError("Escribe un número de WhatsApp de contacto.");
    if (domicilio && !direccion.trim()) return setError("Escribe la dirección de entrega.");

    setEnviando(true);
    try {
      const bloqueoSnap = await getDoc(doc(db, "clientesBloqueados", cedula.trim()));
      if (bloqueoSnap.exists() && bloqueoSnap.data().activo) {
        setError("No es posible registrar el pedido con esta cédula. Comunícate con la finca.");
        setEnviando(false);
        return;
      }

      const nuevoPedido: Omit<Pedido, "id"> = {
        clienteNombre: nombre.trim(),
        clienteCedula: cedula.trim(),
        clienteTelefono: telefono.trim(),
        clienteCorreo: correo.trim(),
        especieId: especie.id,
        especieNombre: especie.nombre,
        kilosSolicitados: kilos,
        precioPorKilo: especie.precioPorKilo,
        domicilio,
        direccionDomicilio: domicilio ? direccion.trim() : "",
        costoDomicilio,
        valorTotal: total,
        estado: "pendiente",
        fechaCreacion: serverTimestamp() as any,
        fechaActualizacion: serverTimestamp() as any,
      };

      const ref = await addDoc(collection(db, "pedidos"), nuevoPedido);
      notificarNuevoPedido({
        folio: folioDe(ref.id),
        clienteNombre: nuevoPedido.clienteNombre,
        clienteTelefono: nuevoPedido.clienteTelefono,
        especieNombre: nuevoPedido.especieNombre,
        kilos: nuevoPedido.kilosSolicitados,
        domicilio: nuevoPedido.domicilio,
        total: nuevoPedido.valorTotal,
        sinStock: kilos > especie.kilosDisponibles,
      });
      onConfirmado(ref.id, { id: ref.id, ...nuevoPedido });
    } catch (e) {
      console.error(e);
      setError("No se pudo registrar el pedido. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <div className="device-head has-back">
        <button className="icon-btn" onClick={onVolver}>
          <Icon name="chevleft" size={18} />
        </button>
        <h2>Pedir {especie.nombre}</h2>
      </div>
      <p className="device-sub">
        <span className="num">{money(especie.precioPorKilo)}</span> por kilogramo
      </p>

      <div className="field">
        <label>¿Cuántos kilos deseas?</label>
        <div className="stepper">
          <button onClick={() => cambiarKg(-0.5)}>
            <Icon name="minus" size={15} />
          </button>
          <input
            className="val num stepper-input"
            type="number"
            inputMode="decimal"
            min="0.5"
            step="0.5"
            value={kilos || ""}
            onChange={(e) => escribirKg(e.target.value)}
          />
          <button onClick={() => cambiarKg(0.5)}>
            <Icon name="plus" size={15} />
          </button>
        </div>
      </div>

      <div className="toggle-row">
        <div>
          <div style={{ fontWeight: 600, fontSize: ".87rem" }}>¿Domicilio?</div>
          <div className="hint">Costo: {money(configuracion.costoDomicilio)} dentro de Ayapel</div>
        </div>
        <label className="switch">
          <input type="checkbox" checked={domicilio} onChange={(e) => setDomicilio(e.target.checked)} />
          <span className="track" />
          <span className="knob" />
        </label>
      </div>

      {domicilio && (
        <div className="field">
          <label>Dirección de entrega</label>
          <textarea
            placeholder="Barrio, calle, referencia..."
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
        </div>
      )}

      <div className="field">
        <label>Nombre completo</label>
        <input
          type="text"
          placeholder="Ej: Carlos Pérez Martínez"
          value={nombre}
          onChange={(e) => setNombre(e.target.value.replace(SOLO_LETRAS, ""))}
        />
        <div className="hint">Solo letras, sin números ni símbolos.</div>
      </div>
      <div className="field">
        <label>Número de cédula</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Ej: 1045678912"
          value={cedula}
          onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
        />
        <div className="hint">
          La usamos para identificar tu historial de pedidos. Si tu cédula fue bloqueada por
          incumplimientos, no podrás completar el pedido.
        </div>
      </div>
      <div className="field">
        <label>WhatsApp de contacto</label>
        <input type="tel" placeholder="Ej: 300 000 0000" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>
      <div className="field">
        <label>Correo electrónico</label>
        <input
          type="email"
          placeholder="Para avisarte si confirman o cancelan tu pedido"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
      </div>

      <div className="summary-card">
        <div className="summary-row">
          <span>
            Alevinos ({kilos.toLocaleString("es-CO", { minimumFractionDigits: 1 })} kg)
          </span>
          <span className="num">{money(subtotal)}</span>
        </div>
        {domicilio && (
          <div className="summary-row">
            <span>Domicilio</span>
            <span className="num">{money(costoDomicilio)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>Total a pagar</span>
          <span className="num">{money(total)}</span>
        </div>
      </div>
      <p className="paylabel">
        El pago se hace en persona (efectivo o transferencia) al recibir el pedido. La página no
        procesa pagos.
      </p>

      {error && <p className="field error">{error}</p>}

      <button className="btn btn-primary" style={{ width: "100%", marginTop: 6 }} onClick={confirmar} disabled={enviando}>
        {enviando ? "Registrando..." : "Confirmar pedido"}
      </button>
    </div>
  );
}
