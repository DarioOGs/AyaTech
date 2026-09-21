import { useState } from "react";
import Catalogo from "../components/cliente/Catalogo";
import Confirmacion from "../components/cliente/Confirmacion";
import FormularioPedido from "../components/cliente/FormularioPedido";
import type { Especie, Pedido } from "../types";

type Paso =
  | { paso: "catalogo" }
  | { paso: "pedido"; especie: Especie }
  | { paso: "confirmacion"; folioId: string; pedido: Pedido };

export default function ClienteApp() {
  const [estado, setEstado] = useState<Paso>({ paso: "catalogo" });

  return (
    <section>
      <p className="caption-note" style={{ maxWidth: "62ch", marginBottom: 20 }}>
        Consulta la disponibilidad y registra tu pedido. El pago se hace en persona al recoger o
        recibir tus alevinos.
      </p>
      {estado.paso === "catalogo" ? (
        <div className="storefront fade-in" key="catalogo">
          <Catalogo onPedir={(especie) => setEstado({ paso: "pedido", especie })} />
        </div>
      ) : (
        <div className="cliente-wrap">
          <div className="device fade-in" key={estado.paso}>
            {estado.paso === "pedido" && (
              <FormularioPedido
                especie={estado.especie}
                onVolver={() => setEstado({ paso: "catalogo" })}
                onConfirmado={(folioId, pedido) => setEstado({ paso: "confirmacion", folioId, pedido })}
              />
            )}
            {estado.paso === "confirmacion" && (
              <Confirmacion
                folioId={estado.folioId}
                pedido={estado.pedido}
                onNuevoPedido={() => setEstado({ paso: "catalogo" })}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
