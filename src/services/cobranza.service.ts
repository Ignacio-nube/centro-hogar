import pool from '../config/database';
import { Pago } from '../models/interfaces';
import { AppError } from '../middleware/error.middleware';

export class CobranzaService {
  async registrarPago(datosPago: {
    id_venta: number;
    monto: number;
    id_tipo_pago: number;
  }): Promise<{ mensaje: string; id_pago: number }> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Obtener información de la venta
      const [ventas] = await connection.query(
        `SELECT v.*, p.monto as monto_pagado, p.id_pago
         FROM VENTA v
         INNER JOIN PAGO p ON v.id_pago = p.id_pago
         WHERE v.id_venta = ?`,
        [datosPago.id_venta]
      );

      if (!Array.isArray(ventas) || ventas.length === 0) {
        throw new AppError('Venta no encontrada', 404);
      }

      const venta = ventas[0] as any;
      const saldo_pendiente = venta.total_venta - venta.monto_pagado;

      if (saldo_pendiente <= 0) {
        throw new AppError('La venta ya está completamente pagada', 400);
      }

      if (datosPago.monto > saldo_pendiente) {
        throw new AppError(
          `El monto excede la deuda pendiente. Saldo: $${saldo_pendiente.toFixed(2)}`,
          400
        );
      }

      // Actualizar el pago existente
      const nuevo_monto = venta.monto_pagado + datosPago.monto;
      const nuevo_estado = nuevo_monto >= venta.total_venta ? 'completado' : 'parcial';

      await connection.query(
        'UPDATE PAGO SET monto = ?, estado = ?, fecha_pago = NOW() WHERE id_pago = ?',
        [nuevo_monto, nuevo_estado, venta.id_pago]
      );

      // Registrar detalle del pago
      await connection.query(
        `INSERT INTO DETALLE_PAGO (id_pago, descripcion_detalle_pago)
         VALUES (?, ?)`,
        [
          venta.id_pago,
          `Pago de $${datosPago.monto.toFixed(2)} - Fecha: ${new Date().toLocaleString()}`
        ]
      );

      // Actualizar estado de venta si está completamente pagada
      if (nuevo_estado === 'completado') {
        await connection.query(
          'UPDATE VENTA SET estado_venta = ? WHERE id_venta = ?',
          ['completada', datosPago.id_venta]
        );
      }

      await connection.commit();

      return {
        mensaje: `Pago registrado exitosamente. Saldo restante: $${(saldo_pendiente - datosPago.monto).toFixed(2)}`,
        id_pago: venta.id_pago
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async obtenerHistorialPagos(id_venta: number): Promise<any[]> {
    const [pagos] = await pool.query(
      `SELECT dp.*, tp.descripcion as tipo_pago, p.fecha_pago, p.monto as monto_total
       FROM DETALLE_PAGO dp
       INNER JOIN PAGO p ON dp.id_pago = p.id_pago
       INNER JOIN TIPOS_PAGO tp ON p.id_tipo_pago = tp.id_tipo_pago
       INNER JOIN VENTA v ON p.id_pago = v.id_pago
       WHERE v.id_venta = ?
       ORDER BY p.fecha_pago DESC`,
      [id_venta]
    );

    return pagos as any[];
  }

  async obtenerCuentasPorCobrar(): Promise<any[]> {
    const [cuentas] = await pool.query(
      `SELECT v.id_venta, v.fecha_venta, v.total_venta,
              c.id_cliente, c.nombre_cliente, c.apellido_cliente, c.DNI_cliente,
              p.monto as monto_pagado,
              (v.total_venta - p.monto) as saldo_pendiente,
              p.estado as estado_pago,
              DATEDIFF(NOW(), v.fecha_venta) as dias_mora
       FROM VENTA v
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       INNER JOIN PAGO p ON v.id_pago = p.id_pago
       WHERE v.estado_venta != 'completada'
       AND v.estado_venta != 'cancelada'
       ORDER BY dias_mora DESC, saldo_pendiente DESC`
    );

    return cuentas as any[];
  }

  async obtenerCuentasVencidas(): Promise<any[]> {
    const [cuentas] = await pool.query(
      `SELECT v.id_venta, v.fecha_venta, v.total_venta,
              c.id_cliente, c.nombre_cliente, c.apellido_cliente, c.DNI_cliente,
              p.monto as monto_pagado,
              (v.total_venta - p.monto) as saldo_pendiente,
              DATEDIFF(NOW(), v.fecha_venta) as dias_mora
       FROM VENTA v
       INNER JOIN CLIENTE c ON v.id_cliente = c.id_cliente
       INNER JOIN PAGO p ON v.id_pago = p.id_pago
       WHERE v.estado_venta != 'completada'
       AND v.estado_venta != 'cancelada'
       AND DATEDIFF(NOW(), v.fecha_venta) > 30
       ORDER BY dias_mora DESC`
    );

    return cuentas as any[];
  }

  async obtenerEstadoCuentaCliente(id_cliente: number): Promise<any> {
    const [resultado] = await pool.query(
      `SELECT 
         COUNT(v.id_venta) as total_ventas,
         SUM(v.total_venta) as total_comprado,
         SUM(p.monto) as total_pagado,
         SUM(v.total_venta - p.monto) as saldo_pendiente
       FROM VENTA v
       INNER JOIN PAGO p ON v.id_pago = p.id_pago
       WHERE v.id_cliente = ?
       AND v.estado_venta != 'cancelada'`,
      [id_cliente]
    );

    const [ventasPendientes] = await pool.query(
      `SELECT v.id_venta, v.fecha_venta, v.total_venta,
              p.monto as monto_pagado,
              (v.total_venta - p.monto) as saldo_pendiente,
              DATEDIFF(NOW(), v.fecha_venta) as dias_mora
       FROM VENTA v
       INNER JOIN PAGO p ON v.id_pago = p.id_pago
       WHERE v.id_cliente = ?
       AND v.estado_venta != 'completada'
       AND v.estado_venta != 'cancelada'
       ORDER BY v.fecha_venta DESC`,
      [id_cliente]
    );

    return {
      resumen: (resultado as any[])[0],
      ventas_pendientes: ventasPendientes
    };
  }
}
