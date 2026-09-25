import { useState } from "react";
import ClientesBloqueados from "../components/admin/ClientesBloqueados";
import Configuracion from "../components/admin/Configuracion";
import EntregasPendientes from "../components/admin/EntregasPendientes";
import Inventario from "../components/admin/Inventario";
import PanelDashboard from "../components/admin/PanelDashboard";
import Pedidos from "../components/admin/Pedidos";
import Reportes from "../components/admin/Reportes";
import Sidebar, { type Seccion } from "../components/admin/Sidebar";
import { useAuth } from "../context/AuthContext";
import AdminLogin from "./AdminLogin";

export default function AdminApp() {
  const { firebaseUser, cargando, sinPermiso, cerrarSesion } = useAuth();
  const [seccion, setSeccion] = useState<Seccion>("panel");

  if (cargando) {
    return <p className="caption-note" style={{ textAlign: "center", padding: 40 }}>Cargando...</p>;
  }

  if (!firebaseUser) {
    return <AdminLogin />;
  }

  if (sinPermiso) {
    return (
      <div className="center-card">
        <h2 style={{ margin: "0 0 8px" }}>Sin acceso todavía</h2>
        <p className="caption-note" style={{ marginBottom: 18 }}>
          Tu cuenta de Google inició sesión correctamente, pero el administrador todavía no te ha
          dado acceso al panel interno. Pídele que agregue tu cuenta desde Firestore →
          <code> usuarios</code>.
        </p>
        <button className="btn btn-outline" style={{ width: "100%" }} onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar seccion={seccion} onCambiar={setSeccion} />
      <div className="panel fade-in" key={seccion}>
        {seccion === "panel" && <PanelDashboard />}
        {seccion === "inventario" && <Inventario />}
        {seccion === "pedidos" && <Pedidos />}
        {seccion === "entregas" && <EntregasPendientes />}
        {seccion === "bloqueados" && <ClientesBloqueados />}
        {seccion === "reportes" && <Reportes />}
        {seccion === "configuracion" && <Configuracion />}
      </div>
    </div>
  );
}
