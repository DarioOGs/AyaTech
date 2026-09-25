import type { Timestamp } from "firebase/firestore";

export interface Usuario {
  nombre: string;
  email: string;
}

export interface Especie {
  id: string;
  nombre: string;
  kilosDisponibles: number;
  precioPorKilo: number;
  activo: boolean;
  imagenUrl?: string;
}

export type EstadoPedido = "pendiente" | "confirmado" | "cancelado";

export interface Pedido {
  id: string;
  clienteNombre: string;
  clienteCedula: string;
  clienteTelefono: string;
  clienteCorreo: string;
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
  | "especie_eliminada"
  | "cambio_precio"
  | "bloqueo"
  | "desbloqueo"
  | "config";

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

export interface Configuracion {
  costoDomicilio: number;
}
