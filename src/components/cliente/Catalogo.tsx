import { useEspecies } from "../../hooks/useEspecies";
import { money } from "../../utils/format";
import Icon from "../Icon";
import type { Especie } from "../../types";

const COLORES = ["var(--water)", "var(--clay)", "var(--leaf)", "var(--water-mid)"];

export default function Catalogo({ onPedir }: { onPedir: (especie: Especie) => void }) {
  const { especies, cargando } = useEspecies(true);

  return (
    <div>
      <div className="device-head">
        <h2>Disponibilidad de hoy</h2>
      </div>
      <p className="device-sub">Precios por kilogramo · actualizado por la finca</p>

      {cargando && <p className="caption-note">Cargando disponibilidad...</p>}
      {!cargando && especies.length === 0 && (
        <p className="caption-note">
          Todavía no hay especies cargadas. El encargado debe agregarlas desde el panel interno →
          Inventario.
        </p>
      )}

      {especies.map((especie, i) => {
        const agotado = especie.kilosDisponibles <= 0;
        return (
          <div className="species-card" style={{ ["--fish-color" as string]: agotado ? "var(--ink-faint)" : COLORES[i % COLORES.length] }} key={especie.id}>
            <div className="species-fish">
              <Icon name="fish" size={26} />
            </div>
            <div className="species-info">
              <div className="sp-name">{especie.nombre}</div>
              <div className="sp-meta">
                {agotado ? (
                  <span className="chip chip-danger">Agotado</span>
                ) : (
                  <span className="chip chip-leaf">
                    {especie.kilosDisponibles.toLocaleString("es-CO", { minimumFractionDigits: 1 })} kg
                    disponibles
                  </span>
                )}
              </div>
              <div className="sp-price num">{money(especie.precioPorKilo)} / kg</div>
            </div>
            {agotado ? (
              <button className="btn btn-outline btn-sm" disabled>
                Sin stock
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => onPedir(especie)}>
                Pedir
              </button>
            )}
          </div>
        );
      })}

      <p className="caption-note">
        ¿No ves lo que buscas? La disponibilidad se actualiza apenas el encargado registra una
        nueva pesca.
      </p>
    </div>
  );
}
