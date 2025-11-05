import pool from '../config/database';
import { Proveedor, Compra, DetalleCompra, PagoProveedor } from '../models/interfaces';
import { AppError } from '../middleware/error.middleware';
import { ProductoService } from './producto.service';

const productoService = new ProductoService();

export class ProveedorService {
  async obtenerTodos(): Promise<Proveedor[]> {
    const [proveedores] = await pool.query(
      'SELECT * FROM PROVEEDORES ORDER BY nombre_prov'
    );
    return proveedores as Proveedor[];
  }

  async obtenerPorId(id_proveedor: number): Promise<Proveedor> {
    const [proveedores] = await pool.query(
      'SELECT * FROM PROVEEDORES WHERE id_proveedor = ?',
      [id_proveedor]
    );

    if (!Array.isArray(proveedores) || proveedores.length === 0) {
      throw new AppError('Proveedor no encontrado', 404);
    }

    return proveedores[0] as Proveedor;
  }

  async crear(proveedor: Proveedor): Promise<{ mensaje: string; id_proveedor: number }> {
    const [result] = await pool.query(
      `INSERT INTO PROVEEDORES (nombre_prov, direccion_prov, contacto_prov)
       VALUES (?, ?, ?)`,
      [proveedor.nombre_prov, proveedor.direccion_prov || null, proveedor.contacto_prov || null]
    );

    return {
      mensaje: 'Proveedor creado exitosamente',
      id_proveedor: (result as any).insertId
    };
  }

  async actualizar(id_proveedor: number, proveedor: Partial<Proveedor>): Promise<{ mensaje: string }> {
    await this.obtenerPorId(id_proveedor);

    const campos: string[] = [];
    const valores: any[] = [];

    if (proveedor.nombre_prov !== undefined) {
      campos.push('nombre_prov = ?');
      valores.push(proveedor.nombre_prov);
    }
    if (proveedor.direccion_prov !== undefined) {
      campos.push('direccion_prov = ?');
      valores.push(proveedor.direccion_prov);
    }
    if (proveedor.contacto_prov !== undefined) {
      campos.push('contacto_prov = ?');
      valores.push(proveedor.contacto_prov);
    }

    if (campos.length === 0) {
      throw new AppError('No hay campos para actualizar', 400);
    }

    valores.push(id_proveedor);

    await pool.query(
      `UPDATE PROVEEDORES SET ${campos.join(', ')} WHERE id_proveedor = ?`,
      valores
    );

    return { mensaje: 'Proveedor actualizado exitosamente' };
  }

  async registrarCompra(datosCompra: {
    id_proveedor: number;
    detalles: Array<{
      id_producto: number;
      cantidad: number;
      precio_unit: number;
    }>;
  }): Promise<{ mensaje: string; id_compra: number }> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Validar proveedor
      await this.obtenerPorId(datosCompra.id_proveedor);

      // Calcular total
      let total = 0;
      for (const detalle of datosCompra.detalles) {
        total += detalle.cantidad * detalle.precio_unit;
      }

      // Crear compra
      const [resultCompra] = await connection.query(
        `INSERT INTO COMPRA (id_proveedor, fecha_compra, total, estado)
         VALUES (?, NOW(), ?, 'pendiente')`,
        [datosCompra.id_proveedor, total]
      );

      const id_compra = (resultCompra as any).insertId;

      // Crear detalles y aumentar stock
      for (const detalle of datosCompra.detalles) {
        const subtotal = detalle.cantidad * detalle.precio_unit;

        await connection.query(
          `INSERT INTO DETALLE_COMPRA (id_compra, id_producto, cantidad, precio_unit, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [id_compra, detalle.id_producto, detalle.cantidad, detalle.precio_unit, subtotal]
        );

        // Aumentar stock automáticamente
        await connection.query(
          'UPDATE PRODUCTOS SET stock = stock + ? WHERE id_producto = ?',
          [detalle.cantidad, detalle.id_producto]
        );
      }

      await connection.commit();

      return {
        mensaje: 'Compra registrada exitosamente y stock actualizado',
        id_compra
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async registrarPagoProveedor(datosPago: {
    id_compra: number;
    monto: number;
    metodo_pago: string;
  }): Promise<{ mensaje: string }> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Verificar compra
      const [compras] = await connection.query(
        'SELECT * FROM COMPRA WHERE id_compra = ?',
        [datosPago.id_compra]
      );

      if (!Array.isArray(compras) || compras.length === 0) {
        throw new AppError('Compra no encontrada', 404);
      }

      const compra = compras[0] as any;

      // Registrar pago
      await connection.query(
        `INSERT INTO PAGO_PROVEEDOR (id_compra, monto, fecha_pago, metodo_pago)
         VALUES (?, ?, NOW(), ?)`,
        [datosPago.id_compra, datosPago.monto, datosPago.metodo_pago]
      );

      // Calcular total pagado
      const [totalPagado] = await connection.query(
        'SELECT SUM(monto) as total FROM PAGO_PROVEEDOR WHERE id_compra = ?',
        [datosPago.id_compra]
      );

      const total_pagado = (totalPagado as any[])[0].total || 0;

      // Actualizar estado de compra
      if (total_pagado >= compra.total) {
        await connection.query(
          'UPDATE COMPRA SET estado = ? WHERE id_compra = ?',
          ['completada', datosPago.id_compra]
        );
      }

      await connection.commit();

      return { mensaje: 'Pago a proveedor registrado exitosamente' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async obtenerEstadoCuenta(id_proveedor: number): Promise<any> {
    const [compras] = await pool.query(
      `SELECT c.id_compra, c.fecha_compra, c.total, c.estado,
              COALESCE(SUM(pp.monto), 0) as total_pagado,
              (c.total - COALESCE(SUM(pp.monto), 0)) as saldo_pendiente
       FROM COMPRA c
       LEFT JOIN PAGO_PROVEEDOR pp ON c.id_compra = pp.id_compra
       WHERE c.id_proveedor = ?
       GROUP BY c.id_compra
       ORDER BY c.fecha_compra DESC`,
      [id_proveedor]
    );

    return compras;
  }

  async obtenerCuentasPorPagar(): Promise<any[]> {
    const [cuentas] = await pool.query(
      `SELECT c.id_compra, c.fecha_compra, c.total,
              p.id_proveedor, p.nombre_prov,
              COALESCE(SUM(pp.monto), 0) as total_pagado,
              (c.total - COALESCE(SUM(pp.monto), 0)) as saldo_pendiente
       FROM COMPRA c
       INNER JOIN PROVEEDORES p ON c.id_proveedor = p.id_proveedor
       LEFT JOIN PAGO_PROVEEDOR pp ON c.id_compra = pp.id_compra
       WHERE c.estado != 'completada'
       GROUP BY c.id_compra
       HAVING saldo_pendiente > 0
       ORDER BY c.fecha_compra ASC`
    );

    return cuentas as any[];
  }
}
