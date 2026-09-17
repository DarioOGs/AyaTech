import type { Timestamp } from "firebase/firestore";

export type Rol = "admin" | "vendedor";

export interface Usuario {
  nombre: string;
  email: string;
  rol: Rol;
}

export interface Especie {
  id: string;
  nombre: string;
  kilosDisponibles: number;
  precioPorKilo: number;
  activo: boolean;
}

export type EstadoPedido = "pendiente" | "confirmado" | "cancelado";

export interface Pedido {
  id: string;
  clienteNombre: string;
  clienteCedula: string;
  clienteTelefono: string;
  especieId: string;
  especieNombre: string;
  kilosSolicitados: number;
  precioPorKilo: number;
  domicilio: boolean;
  direccionDomicilio: string;
  costoDomicilio: number;
  valorTotal: number;
  estado: EstadoPedido;
  motivoCancelacion?: string;
  fechaCreacion: Timestamp | null;
  fechaActualizacion: Timestamp | null;
}

export type TipoAuditoria =
  | "venta"
  | "cancelacion"
  | "adicion_kg"
  | "reduccion_kg"
  | "nueva_especie"
  | "bloqueo"
  | "desbloqueo";

export interface EntradaAuditoria {
  id: string;
  tipo: TipoAuditoria;
  descripcion: string;
  usuarioNombre: string;
  fecha: Timestamp | null;
}

export interface Gasto {
  id: string;
  concepto: string;
  valor: number;
  fecha: Timestamp | null;
  registradoPorNombre: string;
}

export interface ClienteBloqueado {
  cedula: string;
  nombre: string;
  motivo: string;
  activo: boolean;
  fechaBloqueo: Timestamp | null;
  bloqueadoPorNombre: string;
}
