import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { useEspecies } from "../../hooks/useEspecies";
import { kg, money } from "../../utils/format";
import Icon from "../Icon";

export default function Inventario() {
  const { especies } = useEspecies(false);
  const { usuario } = useAuth();
  const [ajustes, setAjustes] = useState<Record<string, string>>({});
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevaEspecie, setNuevaEspecie] = useState({ nombre: "", kilos: "", precio: "" });
  const [guardando, setGuardando] = useState(false);

  async function aplicarAjuste(especieId: string, especieNombre: string, actual: number, signo: 1 | -1) {
    const valor = parseFloat(ajustes[especieId] ?? "");
    if (!valor || valor <= 0) return;

    const delta = signo * valor;
    const nuevo = Math.max(0, Math.round((actual + delta) * 10) / 10);

    await updateDoc(doc(db, "especies", especieId), { kilosDisponibles: nuevo });
    await addDoc(collection(db, "auditoria"), {
      tipo: signo === 1 ? "adicion_kg" : "reduccion_kg",
      descripcion: `${signo === 1 ? "Kilos añadidos" : "Kilos reducidos"} — ${especieNombre} ${signo === 1 ? "+" : "-"}${kg(valor)}`,
      usuarioNombre: usuario?.nombre ?? "Personal",
      fecha: serverTimestamp(),
    });

    setAjustes((prev) => ({ ...prev, [especieId]: "" }));
  }

  async function crearEspecie() {
    if (!nuevaEspecie.nombre.trim()) return;
    const kilos = parseFloat(nuevaEspecie.kilos) || 0;
    const precio = parseFloat(nuevaEspecie.precio) || 0;

    setGuardando(true);
    try {
      await addDoc(collection(db, "especies"), {
        nombre: nuevaEspecie.nombre.trim(),
        kilosDisponibles: kilos,
        precioPorKilo: precio,
        activo: true,
      });
      await addDoc(collection(db, "auditoria"), {
        tipo: "nueva_especie",
        descripcion: `Nueva especie agregada — ${nuevaEspecie.nombre.trim()}`,
        usuarioNombre: usuario?.nombre ?? "Personal",
        fecha: serverTimestamp(),
      });
      setNuevaEspecie({ nombre: "", kilos: "", precio: "" });
      setMostrarForm(false);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Inventario</h2>
          <div className="panel-sub">Ajusta los kilos disponibles apenas termine cada pesca o cada venta.</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setMostrarForm((v) => !v)}>
          + Nueva especie
        </button>
      </div>

      {mostrarForm && (
        <div className="inline-form">
          <div className="field">
            <label>Especie</label>
            <input type="text" placeholder="Ej: Yamú" value={nuevaEspecie.nombre} onChange={(e) => setNuevaEspecie((v) => ({ ...v, nombre: e.target.value }))} />
          </div>
          <div className="field">
            <label>Kilos iniciales</label>
            <input type="number" placeholder="0,0" value={nuevaEspecie.kilos} onChange={(e) => setNuevaEspecie((v) => ({ ...v, kilos: e.target.value }))} />
          </div>
          <div className="field">
            <label>Precio por kilo</label>
            <input type="number" placeholder="0" value={nuevaEspecie.precio} onChange={(e) => setNuevaEspecie((v) => ({ ...v, precio: e.target.value }))} />
          </div>
          <div className="full">
            <button className="btn btn-outline btn-sm" onClick={() => setMostrarForm(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary btn-sm" onClick={crearEspecie} disabled={guardando}>
              Guardar especie
            </button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Especie</th>
              <th>Precio / kg</th>
              <th>Disponible</th>
              <th>Ajustar kilos</th>
            </tr>
          </thead>
          <tbody>
            {especies.map((e) => (
              <tr key={e.id} className={e.kilosDisponibles <= 0 ? "row-muted" : ""}>
                <td className="cell-species">
                  <span className="mini-fish">
                    <Icon name="fish" size={15} />
                  </span>
                  {e.nombre}
                </td>
                <td className="num">{money(e.precioPorKilo)}</td>
                <td className="num">{kg(e.kilosDisponibles)}</td>
                <td>
                  <div className="inv-controls">
                    <input
                      type="number"
                      style={{ width: 72, padding: "6px 8px" }}
                      placeholder="kg"
                      value={ajustes[e.id] ?? ""}
                      onChange={(ev) => setAjustes((prev) => ({ ...prev, [e.id]: ev.target.value }))}
                    />
                    <button className="icon-btn" title="Añadir" onClick={() => aplicarAjuste(e.id, e.nombre, e.kilosDisponibles, 1)}>
                      <Icon name="plus" size={15} />
                    </button>
                    <button className="icon-btn" title="Quitar" onClick={() => aplicarAjuste(e.id, e.nombre, e.kilosDisponibles, -1)}>
                      <Icon name="minus" size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="caption-note">
        Cada ajuste queda anotado en el Historial con la hora, quién lo hizo y cuánto cambió —
        nada se ajusta en silencio.
      </p>
    </div>
  );
}
