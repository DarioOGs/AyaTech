import { useEffect, useState } from "react";
import { useTema } from "../hooks/useTema";
import Icon from "./Icon";

type Vista = "cliente" | "admin";

export default function TopBar({
  vista,
  onCambiarVista,
}: {
  vista: Vista;
  onCambiarVista: (v: Vista) => void;
}) {
  const [online, setOnline] = useState(navigator.onLine);
  const { tema, alternar } = useTema();

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="mark">
            <Icon name="fish" size={22} />
          </div>
          <div className="brand-text">
            <div className="name">AyaTech</div>
            <div className="sub">Finca Nueva Vida el Deseo · venta de alevinos</div>
          </div>
        </div>
        <span className={"status-pill" + (online ? "" : " offline")}>
          <span className="dot" />
          {online ? "En línea · sincronizado" : "Sin conexión · guardando local"}
        </span>

        <button
          className="icon-btn"
          onClick={alternar}
          title={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          aria-label={tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <Icon name={tema === "dark" ? "sun" : "moon"} size={16} />
        </button>

        {vista === "cliente" ? (
          <button className="staff-link" onClick={() => onCambiarVista("admin")}>
            <Icon name="lock" size={14} />
            Acceso del personal
          </button>
        ) : (
          <button className="staff-link" onClick={() => onCambiarVista("cliente")}>
            <Icon name="chevleft" size={14} />
            Volver a la tienda
          </button>
        )}
      </header>

      {!online && (
        <div className="offline-banner" style={{ display: "flex" }}>
          <span className="pulse" />
          Sin conexión a internet: los cambios que hagas ahora se guardan en este dispositivo y se
          sincronizarán solos apenas vuelva la señal.
        </div>
      )}
    </>
  );
}
