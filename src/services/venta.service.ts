import pool from '../config/database';
import { Venta, DetalleVenta, CronogramaPago } from '../models/interfaces';
import { AppError } from '../middleware/error.middleware';
import { ClienteService } from './cliente.service';
import { ProductoService } from './producto.service';

const clienteService = new ClienteService();
const productoService = new ProductoService();

export class VentaService {
  async crear(datosVenta: {
    id_cliente: number;
    id_usuario: number;
    tipo_venta: 'contado' | 'credito';
    id_tipo_pago: number;
    detalles: Array<{
      id_producto: number;
      cantidad: number;
      precio_unitario: number;
      usar_precio_credito: boolean;
    }>;
    plan_pagos?: {
      numero_cuotas: number;
      frecuencia: 'semanal' | 'mensual';
    };
  }): Promise<{ mensaje: string; id_venta: number }> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Validar cliente
      const cliente = await clienteService.obtenerPorId(datosVenta.id_cliente);

      // Si es a crédito, validar estado del cliente
      if (datosVenta.tipo_venta === 'credito') {
        if (!cliente.DNI_cliente) {
          throw new AppError('El cliente debe tener DNI registrado para ventas a crédito', 400);
        }

        const estadoCredito = await clienteService.verificarEstadoParaCredito(datosVenta.id_cliente);
        if (!estadoCredito.puede_credito) {
          throw new AppError(estadoCredito.razon || 'Cliente no puede acceder a crédito', 400);
        }

        if (!datosVenta.plan_pagos) {
          throw new AppError('Debe especificar un plan de pagos para ventas a crédito', 400);
        }
      }

      // Calcular total y validar stock
      let total_venta = 0;
      for (const detalle of datosVenta.detalles) {
        const producto = await productoService.obtenerPorId(detalle.id_producto);
        
        if (producto.stock < detalle.cantidad) {
          throw new AppError(
            `Stock insuficiente para ${producto.nombre_producto}. Disponible: ${producto.stock}`,
            400
          );
        }

        total_venta += detalle.precio_unitario * detalle.cantidad;
      }

      // Crear registro de pago
      const [resultPago] = await connection.query(
        'INSERT INTO PAGO (id_tipo_pago, monto, fecha_pago, estado) VALUES (?, ?, NOW(), ?)',
        [
          datosVenta.id_tipo_pago,
          datosVenta.tipo_venta === 'contado' ? total_venta : 0,
          datosVenta.tipo_venta === 'contado' ? 'completado' : 'pendiente'
        ]
      );

      const id_pago = (resultPago as any).insertId;

      // Crear venta
      const [resultVenta] = await connection.query(
        `INSERT INTO VENTA (id_cliente, id_usuario, id_pago, fecha_venta, 
         total_venta, estado_venta)
         VALUES (?, ?, ?, NOW(), ?, ?)`,
        [
          datosVenta.id_cliente,
          datosVenta.id_usuario,
          id_pago,
          total_venta,
          datosVenta.tipo_venta === 'contado' ? 'completada' : 'pendiente'
        ]
      );

      const id_venta = (resultVenta as any).insertId;

      // Crear detalles de venta y descontar stock
      for (const detalle of datosVenta.detalles) {
        // Crear o obtener precio de venta
        const [resultPrecio] = await connection.query(
          'INSERT INTO PRECIO_VENTA (precio_contado, precio_credito) VALUES (?, ?)',
          [detalle.precio_unitario, detalle.precio_unitario * 1.2] // 20% más para crédito
        );

        const id_precio_venta = (resultPrecio as any).insertId;

        // Insertar detalle
        await connection.query(
          `INSERT INTO DETALLE_VENTA (id_venta, id_producto, id_precio_venta, 
           cantidad, precio_unitario)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id_venta,
            detalle.id_producto,
            id_precio_venta,
            detalle.cantidad,
            detalle.usar_precio_credito ? detalle.precio_unitario * 1.2 : detalle.precio_unitario
          ]
        );

        // Descontar stock
        await connection.query(
          'UPDATE PRODUCTOS SET stock = stock - ? WHERE id_producto = ?',
          [detalle.cantidad, detalle.id_producto]
        );
      }

      // Si es a crédito, generar cronograma de pagos
      if (datosVenta.tipo_venta === 'credito' && datosVenta.plan_pagos) {
        await this.generarCronogramaPagos(
          connection,
          id_venta,
          total_venta,
          datosVenta.plan_pagos.numero_cuotas,
          datosVenta.plan_pagos.frecuencia
        );
      }

      await connection.commit();

      return {
        mensaje: 'Venta registrada exitosamente',
        id_venta
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async generarCronogramaPagos(
    connection: any,
    id_venta: number,
    total: number,
    numero_cuotas: number,
    frecuencia: 'semanal' | 'mensual'
  ): Promise<void> {
    const monto_cuota = total / numero_cuotas;
    const dias_intervalo = frecuencia === 'semanal' ? 7 : 30;

    for (let i = 1; i <= numero_cuotas; i++) {
      await connection.query(
        `INSERT INTO DETALLE_PAGO (id_pago, descripcion_detalle_pago)
         SELECT p.id_pago, CONCAT('Cuota ', ?, ' de ', ?, ' - Vencimiento: ', 
                DATE_ADD(NOW(), INTERVAL ? DAY))
         FROM VENTA v
         INNER JOIN PAGO p ON v.id_pago = p.id_pago
         WHERE v.id_venta = ?`,
        [i, numero_cuotas, i * dias_intervalo, id_venta]
      );
    }
  }

  async obtenerPorId(id_venta: number): Promise<any> {
    const [ventas] = await pool.query(
      `SELECT v.*, 
              c.nombre_cliente, c.apellido_cliente, c.DNI_cliente,
              u.nombre_usuario,
              p.monto as monto_pago, p.estado as estado_pago,
              tp.descripcion as tipo_pago
       FROM VENTA v
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       INNER JOIN USUARIO u ON v.id_usuario = u.id_usuario
       INNER JOIN PAGO p ON v.id_pago = p.id_pago
       INNER JOIN TIPOS_PAGO tp ON p.id_tipo_pago = tp.id_tipo_pago
       WHERE v.id_venta = ?`,
      [id_venta]
    );

    if (!Array.isArray(ventas) || ventas.length === 0) {
      throw new AppError('Venta no encontrada', 404);
    }

    // Obtener detalles
    const [detalles] = await pool.query(
      `SELECT dv.*, p.nombre_producto, pv.precio_contado, pv.precio_credito
       FROM DETALLE_VENTA dv
       INNER JOIN PRODUCTOS p ON dv.id_producto = p.id_producto
       INNER JOIN PRECIO_VENTA pv ON dv.id_precio_venta = pv.id_precio_venta
       WHERE dv.id_venta = ?`,
      [id_venta]
    );

    return {
      ...ventas[0],
      detalles
    };
  }

  async obtenerTodas(filtros?: {
    fecha_desde?: string;
    fecha_hasta?: string;
    id_cliente?: number;
    estado?: string;
  }): Promise<Venta[]> {
    let query = `
      SELECT v.*, 
             c.nombre_cliente, c.apellido_cliente,
             u.nombre_usuario,
             p.estado as estado_pago
      FROM VENTA v
      INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
      INNER JOIN USUARIO u ON v.id_usuario = u.id_usuario
      INNER JOIN PAGO p ON v.id_pago = p.id_pago
      WHERE 1=1
    `;

    const valores: any[] = [];

    if (filtros?.fecha_desde) {
      query += ' AND v.fecha_venta >= ?';
      valores.push(filtros.fecha_desde);
    }

    if (filtros?.fecha_hasta) {
      query += ' AND v.fecha_venta <= ?';
      valores.push(filtros.fecha_hasta);
    }

    if (filtros?.id_cliente) {
      query += ' AND v.id_cliente = ?';
      valores.push(filtros.id_cliente);
    }

    if (filtros?.estado) {
      query += ' AND v.estado_venta = ?';
      valores.push(filtros.estado);
    }

    query += ' ORDER BY v.fecha_venta DESC';

    const [ventas] = await pool.query(query, valores);
    return ventas as Venta[];
  }

  async cancelar(id_venta: number, motivo: string): Promise<{ mensaje: string }> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const venta = await this.obtenerPorId(id_venta);

      if (venta.estado_venta === 'cancelada') {
        throw new AppError('La venta ya está cancelada', 400);
      }

      // Registrar devolución
      const [resultDevolucion] = await connection.query(
        `INSERT INTO DEVOLUCION_VENTA (id_venta, fecha_dev, motivo, 
         tipo_devolucion, estado_vta)
         VALUES (?, NOW(), ?, 'total', 'cancelada')`,
        [id_venta, motivo]
      );

      const id_devolucion = (resultDevolucion as any).insertId;

      // Devolver stock
      for (const detalle of venta.detalles) {
        await connection.query(
          'UPDATE PRODUCTOS SET stock = stock + ? WHERE id_producto = ?',
          [detalle.cantidad, detalle.id_producto]
        );

        // Registrar detalle de devolución
        await connection.query(
          `INSERT INTO DETALLE_DEV_VENTA (id_devolucion, id_producto, cantidad, observacion)
           VALUES (?, ?, ?, ?)`,
          [id_devolucion, detalle.id_producto, detalle.cantidad, 'Cancelación de venta']
        );
      }

      // Actualizar estado de venta
      await connection.query(
        'UPDATE VENTA SET estado_venta = ? WHERE id_venta = ?',
        ['cancelada', id_venta]
      );

      // Actualizar estado de pago
      await connection.query(
        `UPDATE PAGO SET estado = 'cancelado' 
         WHERE id_pago = (SELECT id_pago FROM VENTA WHERE id_venta = ?)`,
        [id_venta]
      );

      await connection.commit();

      return { mensaje: 'Venta cancelada exitosamente' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
