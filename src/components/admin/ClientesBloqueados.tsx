import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { useClientesBloqueados } from "../../hooks/useClientesBloqueados";
import { fechaCorta } from "../../utils/format";

function ocultarCedula(cedula: string): string {
  if (cedula.length <= 4) return cedula;
  return cedula.slice(0, 4) + "••••" + cedula.slice(-2);
}

export default function ClientesBloqueados() {
  const { clientes } = useClientesBloqueados();
  const { usuario } = useAuth();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ cedula: "", nombre: "", motivo: "" });
  const [guardando, setGuardando] = useState(false);

  const activos = clientes.filter((c) => c.activo);

  async function bloquear() {
    if (!form.cedula.trim() || !form.motivo.trim()) return;
    setGuardando(true);
    try {
      await setDoc(doc(db, "clientesBloqueados", form.cedula.trim()), {
        nombre: form.nombre.trim(),
        motivo: form.motivo.trim(),
        activo: true,
        fechaBloqueo: serverTimestamp(),
        bloqueadoPorNombre: usuario?.nombre ?? "Administrador",
      });
      await addDoc(collection(db, "auditoria"), {
        tipo: "bloqueo",
        descripcion: `Cliente bloqueado — C.C. ${ocultarCedula(form.cedula.trim())} — ${form.motivo.trim()}`,
        usuarioNombre: usuario?.nombre ?? "Administrador",
        fecha: serverTimestamp(),
      });
      setForm({ cedula: "", nombre: "", motivo: "" });
      setMostrarForm(false);
    } finally {
      setGuardando(false);
    }
  }

  async function desbloquear(cedula: string) {
    await updateDoc(doc(db, "clientesBloqueados", cedula), { activo: false });
    await addDoc(collection(db, "auditoria"), {
      tipo: "desbloqueo",
      descripcion: `Cliente desbloqueado — C.C. ${ocultarCedula(cedula)}`,
      usuarioNombre: usuario?.nombre ?? "Administrador",
      fecha: serverTimestamp(),
    });
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Clientes bloqueados</h2>
          <div className="panel-sub">
            Se identifica a cada cliente por cédula: si alguien da problemas, se bloquea su
            número y no puede volver a pedir con esa cédula.
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setMostrarForm((v) => !v)}>
          + Bloquear cliente
        </button>
      </div>

      {mostrarForm && (
        <div className="inline-form">
          <div className="field">
            <label>Cédula</label>
            <input type="text" inputMode="numeric" placeholder="1050XXXXXX" value={form.cedula} onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value.replace(/\D/g, "") }))} />
          </div>
          <div className="field">
            <label>Nombre</label>
            <input type="text" placeholder="Nombre del cliente" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="field">
            <label>Motivo</label>
            <input type="text" placeholder="Ej: no recogió 2 pedidos" value={form.motivo} onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))} />
          </div>
          <div className="full">
            <button className="btn btn-outline btn-sm" onClick={() => setMostrarForm(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary btn-sm" disabled={guardando} onClick={bloquear}>
              Bloquear
            </button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Motivo</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {activos.length === 0 && (
              <tr>
                <td colSpan={5} className="caption-note">
                  No hay clientes bloqueados actualmente.
                </td>
              </tr>
            )}
            {activos.map((c) => (
              <tr key={c.cedula}>
                <td>{ocultarCedula(c.cedula)}</td>
                <td>{c.nombre}</td>
                <td>{c.motivo}</td>
                <td>{fechaCorta(c.fechaBloqueo)}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => desbloquear(c.cedula)}>
                    Desbloquear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
