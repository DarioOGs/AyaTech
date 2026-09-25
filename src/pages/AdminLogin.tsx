import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

export default function AdminLogin() {
  const { iniciarSesion } = useAuth();
  return (
    <div className="center-card">
      <div className="mark" style={{ width: 48, height: 48, margin: "0 auto 16px" }}>
        <Icon name="fish" size={26} />
      </div>
      <h2 style={{ margin: "0 0 6px" }}>Panel interno</h2>
      <p className="caption-note" style={{ marginBottom: 20 }}>
        Solo el administrador de la finca puede entrar aquí, con su cuenta de Google autorizada.
      </p>
      <button className="btn btn-primary" style={{ width: "100%" }} onClick={iniciarSesion}>
        Iniciar sesión con Google
      </button>
    </div>
  );
}
