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
        <p>
          Precios actualizados · <span className="fecha">{hoy}</span>
        </p>
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
        {especies.map((especie, i) => (
          <div
            className="species-card fade-in"
            style={{ ["--fish-color" as string]: colorDeEspecie(especie.nombre), animationDelay: `${i * 60}ms` }}
            key={especie.id}
          >
            <EspecieThumb nombre={especie.nombre} imagenUrl={especie.imagenUrl} tamano="grande" />
            <div className="species-info">
              <div className="sp-name">{especie.nombre}</div>
              <div className="sp-price num">{money(especie.precioPorKilo)} / kg</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => onPedir(especie)}>
              Hacer pedido
            </button>
          </div>
        ))}
      </div>

      <p className="caption-note">
        ¿No ves lo que buscas? Puedes hacer el pedido de todos modos: si en ese momento no hay
        suficiente en la finca, el encargado se pondrá en contacto contigo para coordinar la
        entrega.
      </p>
    </div>
  );
}
