import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { useEspecies } from "../../hooks/useEspecies";
import EspecieThumb from "../EspecieThumb";
import { colorDeEspecie } from "../../utils/colors";
import { kg, money } from "../../utils/format";
import Icon from "../Icon";

const CLOUDINARY_URL = "https://cloudinary.com/console/media_library";

function AyudaFoto() {
  return (
    <div className="hint">
      ¿No tienes el enlace?{" "}
      <a href={CLOUDINARY_URL} target="_blank" rel="noopener noreferrer">
        Abre Cloudinary (gratis) ↗
      </a>
      , sube la foto ahí, luego clic derecho sobre la imagen → "Copiar dirección de la imagen" y
      pégala aquí.
    </div>
  );
}

export default function Inventario() {
  const { especies } = useEspecies(false);
  const { usuario } = useAuth();
  const [ajustes, setAjustes] = useState<Record<string, string>>({});
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevaEspecie, setNuevaEspecie] = useState({ nombre: "", kilos: "", precio: "", imagenUrl: "" });
  const [guardando, setGuardando] = useState(false);
  const [fotoAbierta, setFotoAbierta] = useState<string | null>(null);
  const [fotoValor, setFotoValor] = useState("");

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
        imagenUrl: nuevaEspecie.imagenUrl.trim(),
        activo: true,
      });
      await addDoc(collection(db, "auditoria"), {
        tipo: "nueva_especie",
        descripcion: `Nueva especie agregada — ${nuevaEspecie.nombre.trim()}`,
        usuarioNombre: usuario?.nombre ?? "Personal",
        fecha: serverTimestamp(),
      });
      setNuevaEspecie({ nombre: "", kilos: "", precio: "", imagenUrl: "" });
      setMostrarForm(false);
    } finally {
      setGuardando(false);
    }
  }

  function abrirFoto(especieId: string, actual?: string) {
    setFotoAbierta(especieId);
    setFotoValor(actual ?? "");
  }

  async function guardarFoto(especieId: string) {
    await updateDoc(doc(db, "especies", especieId), { imagenUrl: fotoValor.trim() });
    setFotoAbierta(null);
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
          <div className="field" style={{ gridColumn: "1/-1" }}>
            <label>URL de la foto (opcional)</label>
            <input
              type="text"
              placeholder="https://res.cloudinary.com/..."
              value={nuevaEspecie.imagenUrl}
              onChange={(e) => setNuevaEspecie((v) => ({ ...v, imagenUrl: e.target.value }))}
            />
            <AyudaFoto />
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
              <th>Foto</th>
              <th>Precio / kg</th>
              <th>Disponible</th>
              <th>Ajustar kilos</th>
            </tr>
          </thead>
          <tbody>
            {especies.map((e) => (
              <tr key={e.id} className={e.kilosDisponibles <= 0 ? "row-muted" : ""}>
                <td className="cell-species" style={{ ["--fish-color" as string]: colorDeEspecie(e.nombre) }}>
                  <EspecieThumb nombre={e.nombre} imagenUrl={e.imagenUrl} />
                  {e.nombre}
                </td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => abrirFoto(e.id, e.imagenUrl)}>
                    {e.imagenUrl ? "Cambiar" : "Agregar"}
                  </button>
                  {fotoAbierta === e.id && (
                    <div className="inline-form" style={{ marginTop: 8, gridTemplateColumns: "1fr" }}>
                      <div className="field">
                        <label>URL de la foto</label>
                        <input type="text" placeholder="https://res.cloudinary.com/..." value={fotoValor} onChange={(ev) => setFotoValor(ev.target.value)} />
                        <AyudaFoto />
                      </div>
                      <div className="full">
                        <button className="btn btn-outline btn-sm" onClick={() => setFotoAbierta(null)}>
                          Cancelar
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => guardarFoto(e.id)}>
                          Guardar foto
                        </button>
                      </div>
                    </div>
                  )}
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
