import { useAuth } from "../../context/AuthContext";
import Icon, { type IconName } from "../Icon";

export type Seccion =
  | "panel"
  | "inventario"
  | "pedidos"
  | "historial"
  | "bloqueados"
  | "reportes"
  | "gastos";

const ITEMS: { seccion: Seccion; label: string; icon: IconName; soloAdmin?: boolean }[] = [
  { seccion: "panel", label: "Panel", icon: "grid" },
  { seccion: "inventario", label: "Inventario", icon: "box" },
  { seccion: "pedidos", label: "Pedidos", icon: "list" },
  { seccion: "historial", label: "Historial", icon: "clock" },
  { seccion: "bloqueados", label: "Clientes bloqueados", icon: "ban", soloAdmin: true },
  { seccion: "reportes", label: "Reportes", icon: "bars", soloAdmin: true },
  { seccion: "gastos", label: "Gastos", icon: "wallet", soloAdmin: true },
];

export default function Sidebar({
  seccion,
  onCambiar,
}: {
  seccion: Seccion;
  onCambiar: (s: Seccion) => void;
}) {
  const { usuario, cerrarSesion } = useAuth();
  const esAdmin = usuario?.rol === "admin";
  const ocultos = ITEMS.filter((i) => i.soloAdmin && !esAdmin).length;

  return (
    <nav className="sidebar">
      <div className="navlist">
        {ITEMS.filter((i) => !i.soloAdmin || esAdmin).map((item) => (
          <button
            key={item.seccion}
            className={seccion === item.seccion ? "active" : ""}
            onClick={() => onCambiar(item.seccion)}
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </button>
        ))}
      </div>

      {!esAdmin && ocultos > 0 && (
        <p className="caption-note" style={{ marginTop: 10 }}>
          Tu rol de vendedor no ve Clientes bloqueados, Reportes ni Gastos: eso queda reservado al
          administrador.
        </p>
      )}

      <div className="sidebar-foot">
        <div className="sidebar-user">
          {usuario?.nombre}
          <br />
          <span className="rol">{esAdmin ? "Administrador" : "Vendedor"}</span>
        </div>
        <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
