import { useEspecies } from "../../hooks/useEspecies";
import { colorDeEspecie } from "../../utils/colors";
import { money } from "../../utils/format";
import EspecieThumb from "../EspecieThumb";
import type { Especie } from "../../types";

export default function Catalogo({ onPedir }: { onPedir: (especie: Especie) => void }) {
  const { especies, cargando, error } = useEspecies(true);
  const hoy = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <div className="catalog-hero">
        <svg className="pattern" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <pattern id="fishPattern" width="46" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)">
              <path
                d="M3 12C7 5 15 2 22 2c6 0 11 3 14 7l5-4v14l-5-4c-3 4-8 7-14 7-7 0-15-3-19-10z"
                fill="none"
                stroke="white"
                strokeWidth="1.4"
                transform="scale(0.55)"
              />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#fishPattern)" />
        </svg>
        <h2>Alevinos frescos de la finca</h2>
        <p>Disponibilidad actualizada · {hoy}</p>
      </div>

      <p className="device-sub">Precios por kilogramo</p>

      {cargando && <p className="caption-note">Cargando disponibilidad...</p>}
      {error && <p className="field error">{error}</p>}
      {!cargando && !error && especies.length === 0 && (
        <p className="caption-note">
          Todavía no hay especies cargadas. El encargado debe agregarlas desde el panel interno →
          Inventario.
        </p>
      )}

      <div className="species-grid">
        {especies.map((especie, i) => {
          const agotado = especie.kilosDisponibles <= 0;
          return (
            <div
              className="species-card fade-in"
              style={{ ["--fish-color" as string]: agotado ? "var(--ink-faint)" : colorDeEspecie(especie.nombre), animationDelay: `${i * 60}ms` }}
              key={especie.id}
            >
              <EspecieThumb nombre={especie.nombre} imagenUrl={especie.imagenUrl} tamano="grande" />
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
      </div>

      <p className="caption-note">
        ¿No ves lo que buscas? La disponibilidad se actualiza apenas el encargado registra una
        nueva pesca.
      </p>
    </div>
  );
}
