import { useAuth } from "../../context/AuthContext";
import Icon, { type IconName } from "../Icon";

export type Seccion =
  | "panel"
  | "inventario"
  | "pedidos"
  | "historial"
  | "bloqueados"
  | "reportes"
  | "gastos"
  | "configuracion";

const ITEMS: { seccion: Seccion; label: string; icon: IconName }[] = [
  { seccion: "panel", label: "Panel", icon: "grid" },
  { seccion: "inventario", label: "Inventario", icon: "box" },
  { seccion: "pedidos", label: "Pedidos", icon: "list" },
  { seccion: "historial", label: "Historial de ventas", icon: "clock" },
  { seccion: "bloqueados", label: "Clientes bloqueados", icon: "ban" },
  { seccion: "reportes", label: "Reportes", icon: "bars" },
  { seccion: "gastos", label: "Gastos", icon: "wallet" },
  { seccion: "configuracion", label: "Configuración", icon: "gear" },
];

export default function Sidebar({
  seccion,
  onCambiar,
}: {
  seccion: Seccion;
  onCambiar: (s: Seccion) => void;
}) {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <nav className="sidebar">
      <div className="navlist">
        {ITEMS.map((item) => (
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

      <div className="sidebar-foot">
        <div className="sidebar-user">
          {usuario?.nombre}
          <br />
          <span className="rol">Administrador</span>
        </div>
        <button className="btn btn-outline btn-sm" style={{ width: "100%" }} onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
