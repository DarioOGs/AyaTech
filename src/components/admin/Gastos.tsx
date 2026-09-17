import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { useGastos } from "../../hooks/useGastos";
import { inicioDelMes } from "../../utils/dates";
import { fechaCorta, money } from "../../utils/format";

export default function Gastos() {
  const { gastos } = useGastos();
  const { usuario } = useAuth();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ concepto: "", valor: "" });
  const [guardando, setGuardando] = useState(false);

  const totalMes = useMemo(() => {
    const inicio = inicioDelMes();
    return gastos.filter((g) => g.fecha && g.fecha.toDate() >= inicio).reduce((s, g) => s + g.valor, 0);
  }, [gastos]);

  async function guardarGasto() {
    const valor = parseFloat(form.valor);
    if (!form.concepto.trim() || !valor) return;
    setGuardando(true);
    try {
      await addDoc(collection(db, "gastos"), {
        concepto: form.concepto.trim(),
        valor,
        fecha: serverTimestamp(),
        registradoPorNombre: usuario?.nombre ?? "Administrador",
      });
      setForm({ concepto: "", valor: "" });
      setMostrarForm(false);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="panel-head">
        <div>
          <h2>Gastos</h2>
          <div className="panel-sub">Se restan de las ventas para calcular la ganancia neta de los reportes.</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setMostrarForm((v) => !v)}>
          + Registrar gasto
        </button>
      </div>

      {mostrarForm && (
        <div className="inline-form">
          <div className="field">
            <label>Concepto</label>
            <input type="text" placeholder="Ej: alimento concentrado" value={form.concepto} onChange={(e) => setForm((f) => ({ ...f, concepto: e.target.value }))} />
          </div>
          <div className="field">
            <label>Valor</label>
            <input type="number" placeholder="0" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} />
          </div>
          <div className="full">
            <button className="btn btn-outline btn-sm" onClick={() => setMostrarForm(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary btn-sm" disabled={guardando} onClick={guardarGasto}>
              Guardar gasto
            </button>
          </div>
        </div>
      )}

      <div className="expense-total">
        <span>Gastos de este mes</span>
        <span className="val num">{money(totalMes)}</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Valor</th>
              <th>Fecha</th>
              <th>Registrado por</th>
            </tr>
          </thead>
          <tbody>
            {gastos.length === 0 && (
              <tr>
                <td colSpan={4} className="caption-note">
                  Todavía no hay gastos registrados.
                </td>
              </tr>
            )}
            {gastos.map((g) => (
              <tr key={g.id}>
                <td>{g.concepto}</td>
                <td className="num">{money(g.valor)}</td>
                <td>{fechaCorta(g.fecha)}</td>
                <td>{g.registradoPorNombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
