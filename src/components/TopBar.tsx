import { useEffect, useState } from "react";
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
        <div className="segmented" role="tablist" aria-label="Cambiar de vista">
          <button className={vista === "cliente" ? "active" : ""} onClick={() => onCambiarVista("cliente")}>
            Vista cliente
          </button>
          <button className={vista === "admin" ? "active" : ""} onClick={() => onCambiarVista("admin")}>
            Panel interno
          </button>
        </div>
        <span className={"status-pill" + (online ? "" : " offline")}>
          <span className="dot" />
          {online ? "En línea · sincronizado" : "Sin conexión · guardando local"}
        </span>
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
