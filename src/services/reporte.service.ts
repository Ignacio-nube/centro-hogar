import pool from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class ReporteService {
  async reporteVentas(filtros: {
    fecha_desde?: string;
    fecha_hasta?: string;
    periodo?: 'dia' | 'semana' | 'mes' | 'año';
  }): Promise<any> {
    let query = `
      SELECT 
        DATE(v.fecha_venta) as fecha,
        COUNT(v.id_venta) as total_ventas,
        SUM(v.total_venta) as monto_total,
        SUM(CASE WHEN v.estado_venta = 'completada' THEN v.total_venta ELSE 0 END) as ventas_completadas,
        SUM(CASE WHEN v.estado_venta = 'pendiente' THEN v.total_venta ELSE 0 END) as ventas_pendientes,
        SUM(p.monto) as total_cobrado
      FROM VENTA v
      INNER JOIN PAGO p ON v.id_pago = p.id_pago
      WHERE v.estado_venta != 'cancelada'
    `;

    const valores: any[] = [];

    if (filtros.fecha_desde) {
      query += ' AND v.fecha_venta >= ?';
      valores.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      query += ' AND v.fecha_venta <= ?';
      valores.push(filtros.fecha_hasta);
    }

    // Agrupar por período
    if (filtros.periodo) {
      switch (filtros.periodo) {
        case 'dia':
          query += ' GROUP BY DATE(v.fecha_venta)';
          break;
        case 'semana':
          query += ' GROUP BY YEARWEEK(v.fecha_venta)';
          break;
        case 'mes':
          query += ' GROUP BY YEAR(v.fecha_venta), MONTH(v.fecha_venta)';
          break;
        case 'año':
          query += ' GROUP BY YEAR(v.fecha_venta)';
          break;
      }
    } else {
      query += ' GROUP BY DATE(v.fecha_venta)';
    }

    query += ' ORDER BY fecha DESC';

    const [resultado] = await pool.query(query, valores);
    return resultado;
  }

  async reporteCobranzas(filtros: {
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<any> {
    let query = `
      SELECT 
        DATE(p.fecha_pago) as fecha,
        COUNT(DISTINCT v.id_venta) as total_pagos,
        SUM(p.monto) as monto_total_cobrado,
        tp.descripcion as tipo_pago,
        COUNT(DISTINCT v.id_cliente) as clientes_distintos
      FROM PAGO p
      INNER JOIN TIPOS_PAGO tp ON p.id_tipo_pago = tp.id_tipo_pago
      INNER JOIN VENTA v ON p.id_pago = v.id_pago
      WHERE p.estado != 'cancelado'
    `;

    const valores: any[] = [];

    if (filtros.fecha_desde) {
      query += ' AND p.fecha_pago >= ?';
      valores.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      query += ' AND p.fecha_pago <= ?';
      valores.push(filtros.fecha_hasta);
    }

    query += ' GROUP BY DATE(p.fecha_pago), tp.descripcion ORDER BY fecha DESC';

    const [resultado] = await pool.query(query, valores);
    return resultado;
  }

  async reporteFlujoEfectivo(filtros: {
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<any> {
    const valores: any[] = filtros.fecha_desde ? [filtros.fecha_desde, filtros.fecha_hasta || new Date()] : [];

    // Ingresos por ventas
    const queryIngresos = `
      SELECT 
        DATE(p.fecha_pago) as fecha,
        'Ingreso' as tipo,
        'Venta' as concepto,
        SUM(p.monto) as monto
      FROM PAGO p
      INNER JOIN VENTA v ON p.id_pago = v.id_pago
      WHERE p.estado != 'cancelado'
      ${filtros.fecha_desde ? 'AND p.fecha_pago >= ? AND p.fecha_pago <= ?' : ''}
      GROUP BY DATE(p.fecha_pago)
    `;

    // Egresos por pagos a proveedores
    const queryEgresos = `
      SELECT 
        DATE(pp.fecha_pago) as fecha,
        'Egreso' as tipo,
        'Pago a Proveedor' as concepto,
        SUM(pp.monto) as monto
      FROM PAGO_PROVEEDOR pp
      ${filtros.fecha_desde ? 'WHERE pp.fecha_pago >= ? AND pp.fecha_pago <= ?' : ''}
      GROUP BY DATE(pp.fecha_pago)
    `;

    const [ingresos] = await pool.query(queryIngresos, valores);
    const [egresos] = await pool.query(queryEgresos, valores);

    // Calcular resumen
    const totalIngresos = (ingresos as any[]).reduce((sum, item) => sum + parseFloat(item.monto), 0);
    const totalEgresos = (egresos as any[]).reduce((sum, item) => sum + parseFloat(item.monto), 0);

    return {
      resumen: {
        total_ingresos: totalIngresos,
        total_egresos: totalEgresos,
        flujo_neto: totalIngresos - totalEgresos
      },
      ingresos,
      egresos,
      movimientos: [...(ingresos as any[]), ...(egresos as any[])].sort((a: any, b: any) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
    };
  }

  async reporteProductosMasVendidos(filtros: {
    fecha_desde?: string;
    fecha_hasta?: string;
    limite?: number;
  }): Promise<any> {
    let query = `
      SELECT 
        p.id_producto,
        p.nombre_producto,
        p.categoria,
        SUM(dv.cantidad) as total_vendido,
        COUNT(DISTINCT v.id_venta) as numero_ventas,
        SUM(dv.cantidad * dv.precio_unitario) as ingresos_generados
      FROM DETALLE_VENTA dv
      INNER JOIN PRODUCTOS p ON dv.id_producto = p.id_producto
      INNER JOIN VENTA v ON dv.id_venta = v.id_venta
      WHERE v.estado_venta != 'cancelada'
    `;

    const valores: any[] = [];

    if (filtros.fecha_desde) {
      query += ' AND v.fecha_venta >= ?';
      valores.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      query += ' AND v.fecha_venta <= ?';
      valores.push(filtros.fecha_hasta);
    }

    query += ` GROUP BY p.id_producto, p.nombre_producto, p.categoria
               ORDER BY total_vendido DESC
               LIMIT ?`;
    valores.push(filtros.limite || 10);

    const [resultado] = await pool.query(query, valores);
    return resultado;
  }

  async reporteClientesTop(filtros: {
    fecha_desde?: string;
    fecha_hasta?: string;
    limite?: number;
  }): Promise<any> {
    let query = `
      SELECT 
        c.id_cliente,
        c.nombre_cliente,
        c.apellido_cliente,
        c.DNI_cliente,
        COUNT(v.id_venta) as total_compras,
        SUM(v.total_venta) as monto_total_comprado,
        SUM(p.monto) as total_pagado,
        SUM(v.total_venta - p.monto) as saldo_pendiente
      FROM CLIENTE c
      INNER JOIN VENTA v ON c.id_cliente = v.id_cliente
      INNER JOIN PAGO p ON v.id_pago = p.id_pago
      WHERE v.estado_venta != 'cancelada'
    `;

    const valores: any[] = [];

    if (filtros.fecha_desde) {
      query += ' AND v.fecha_venta >= ?';
      valores.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      query += ' AND v.fecha_venta <= ?';
      valores.push(filtros.fecha_hasta);
    }

    query += ` GROUP BY c.id_cliente, c.nombre_cliente, c.apellido_cliente, c.DNI_cliente
               ORDER BY monto_total_comprado DESC
               LIMIT ?`;
    valores.push(filtros.limite || 10);

    const [resultado] = await pool.query(query, valores);
    return resultado;
  }

  async reporteInventario(): Promise<any> {
    const [productos] = await pool.query(
      `SELECT 
        p.id_producto,
        p.nombre_producto,
        p.categoria,
        p.stock,
        p.stock_minimo,
        pr.nombre_prov as proveedor,
        CASE 
          WHEN p.stock = 0 THEN 'Sin Stock'
          WHEN p.stock <= p.stock_minimo THEN 'Stock Bajo'
          ELSE 'Stock Normal'
        END as estado_stock
      FROM PRODUCTOS p
      LEFT JOIN PROVEEDORES pr ON p.id_proveedor = pr.id_proveedor
      ORDER BY 
        CASE 
          WHEN p.stock = 0 THEN 1
          WHEN p.stock <= p.stock_minimo THEN 2
          ELSE 3
        END,
        p.nombre_producto`
    );

    const [resumen] = await pool.query(
      `SELECT 
        COUNT(*) as total_productos,
        SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as sin_stock,
        SUM(CASE WHEN stock <= stock_minimo AND stock > 0 THEN 1 ELSE 0 END) as stock_bajo,
        SUM(CASE WHEN stock > stock_minimo THEN 1 ELSE 0 END) as stock_normal,
        SUM(stock) as total_unidades
      FROM PRODUCTOS`
    );

    return {
      resumen: (resumen as any[])[0],
      productos
    };
  }

  async reporteProveedores(): Promise<any> {
    const [proveedores] = await pool.query(
      `SELECT 
        p.id_proveedor,
        p.nombre_prov,
        COUNT(DISTINCT c.id_compra) as total_compras,
        SUM(c.total) as monto_total_comprado,
        COALESCE(SUM(pp.monto), 0) as total_pagado,
        (SUM(c.total) - COALESCE(SUM(pp.monto), 0)) as saldo_pendiente,
        COUNT(DISTINCT prod.id_producto) as productos_suministrados
      FROM PROVEEDORES p
      LEFT JOIN COMPRA c ON p.id_proveedor = c.id_proveedor
      LEFT JOIN PAGO_PROVEEDOR pp ON c.id_compra = pp.id_compra
      LEFT JOIN PRODUCTOS prod ON p.id_proveedor = prod.id_proveedor
      GROUP BY p.id_proveedor, p.nombre_prov
      ORDER BY monto_total_comprado DESC`
    );

    return proveedores;
  }
}
