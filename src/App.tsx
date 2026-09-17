import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import { AuthProvider } from "./context/AuthContext";
import AdminApp from "./pages/AdminApp";
import ClienteApp from "./pages/ClienteApp";

type Vista = "cliente" | "admin";

function vistaDesdeHash(): Vista {
  return window.location.hash === "#admin" ? "admin" : "cliente";
}

export default function App() {
  const [vista, setVista] = useState<Vista>(vistaDesdeHash());

  useEffect(() => {
    const onHashChange = () => setVista(vistaDesdeHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function cambiarVista(v: Vista) {
    window.location.hash = v === "admin" ? "#admin" : "";
    setVista(v);
  }

  return (
    <AuthProvider>
      <div className="page">
        <TopBar vista={vista} onCambiarVista={cambiarVista} />
        {vista === "cliente" ? <ClienteApp /> : <AdminApp />}
      </div>
    </AuthProvider>
  );
}
