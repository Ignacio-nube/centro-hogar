export interface Cliente {
  id_cliente?: number;
  nombre_cliente: string;
  apellido_cliente: string;
  DNI_cliente: string;
  direccion_cliente?: string;
  telefono_cliente?: string;
  mail_cliente?: string;
  estado_cliente: 'activo' | 'bloqueado';
}

export interface Proveedor {
  id_proveedor?: number;
  nombre_prov: string;
  direccion_prov?: string;
  contacto_prov?: string;
}

export interface Producto {
  id_producto?: number;
  nombre_producto: string;
  descripcion?: string;
  categoria?: 'muebles' | 'electrodomesticos' | 'colchones';
  stock: number;
  stock_minimo: number;
  id_proveedor?: number;
}

export interface PrecioVenta {
  id_precio_venta?: number;
  precio_contado: number;
  precio_credito: number;
}

export interface TipoPago {
  id_tipo_pago?: number;
  descripcion: string;
}

export interface Pago {
  id_pago?: number;
  id_tipo_pago: number;
  monto: number;
  fecha_pago: Date;
  estado: 'pendiente' | 'completado' | 'parcial';
}

export interface DetallePago {
  id_detalle_pago?: number;
  id_pago: number;
  descripcion_detalle_pago?: string;
}

export interface Login {
  id_login?: number;
  estado_sesion: 'activo' | 'inactivo';
}

export interface Perfil {
  id_perfil?: number;
  rol: 'Administrador' | 'Vendedor' | 'Encargado de Stock';
}

export interface Usuario {
  id_usuario?: number;
  id_login: number;
  id_perfil: number;
  nombre_usuario: string;
  contraseña_usu: string;
}

export interface Venta {
  id_venta?: number;
  id_cliente: number;
  id_usuario: number;
  id_pago: number;
  fecha_venta: Date;
  total_venta: number;
  estado_venta: 'completada' | 'pendiente' | 'cancelada';
  tipo_venta?: 'contado' | 'credito';
}

export interface DetalleVenta {
  id_detalle_venta?: number;
  id_venta: number;
  id_producto: number;
  id_precio_venta: number;
  cantidad: number;
  precio_unitario: number;
}

export interface DevolucionVenta {
  id_devolucion?: number;
  id_venta: number;
  fecha_dev: Date;
  motivo?: string;
  tipo_devolucion: 'parcial' | 'total';
  estado_vta: string;
}

export interface DetalleDevVenta {
  id_detalle_dev?: number;
  id_devolucion: number;
  id_producto: number;
  cantidad: number;
  observacion?: string;
}

export interface Compra {
  id_compra?: number;
  id_proveedor: number;
  fecha_compra: Date;
  total: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
}

export interface DetalleCompra {
  id_det_compra?: number;
  id_compra: number;
  id_producto: number;
  cantidad: number;
  precio_unit: number;
  subtotal: number;
}

export interface PagoProveedor {
  id_pago_prov?: number;
  id_compra: number;
  monto: number;
  fecha_pago: Date;
  metodo_pago: string;
}

export interface CronogramaPago {
  id_cuota?: number;
  id_venta: number;
  numero_cuota: number;
  monto_cuota: number;
  fecha_vencimiento: Date;
  fecha_pago?: Date;
  estado_cuota: 'pendiente' | 'pagada' | 'vencida';
}
