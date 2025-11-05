import pool from '../config/database';
import { Producto } from '../models/interfaces';
import { AppError } from '../middleware/error.middleware';

export class ProductoService {
  async obtenerTodos(): Promise<Producto[]> {
    const [productos] = await pool.query(
      `SELECT p.*, pr.nombre_prov
       FROM PRODUCTOS p
       LEFT JOIN PROVEEDORES pr ON p.id_proveedor = pr.id_proveedor
       ORDER BY p.id_producto DESC`
    );
    return productos as Producto[];
  }

  async obtenerPorId(id_producto: number): Promise<Producto> {
    const [productos] = await pool.query(
      `SELECT p.*, pr.nombre_prov
       FROM PRODUCTOS p
       LEFT JOIN PROVEEDORES pr ON p.id_proveedor = pr.id_proveedor
       WHERE p.id_producto = ?`,
      [id_producto]
    );

    if (!Array.isArray(productos) || productos.length === 0) {
      throw new AppError('Producto no encontrado', 404);
    }

    return productos[0] as Producto;
  }

  async obtenerPorCategoria(categoria: string): Promise<Producto[]> {
    const [productos] = await pool.query(
      `SELECT p.*, pr.nombre_prov
       FROM PRODUCTOS p
       LEFT JOIN PROVEEDORES pr ON p.id_proveedor = pr.id_proveedor
       WHERE p.categoria = ?
       ORDER BY p.nombre_producto`,
      [categoria]
    );
    return productos as Producto[];
  }

  async obtenerBajoStock(): Promise<Producto[]> {
    const [productos] = await pool.query(
      `SELECT p.*, pr.nombre_prov
       FROM PRODUCTOS p
       LEFT JOIN PROVEEDORES pr ON p.id_proveedor = pr.id_proveedor
       WHERE p.stock <= p.stock_minimo
       ORDER BY p.stock ASC`
    );
    return productos as Producto[];
  }

  async crear(producto: Producto): Promise<{ mensaje: string; id_producto: number }> {
    const [result] = await pool.query(
      `INSERT INTO PRODUCTOS (nombre_producto, descripcion, categoria, stock, 
       stock_minimo, id_proveedor)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        producto.nombre_producto,
        producto.descripcion || null,
        producto.categoria || null,
        producto.stock,
        producto.stock_minimo,
        producto.id_proveedor || null
      ]
    );

    return {
      mensaje: 'Producto creado exitosamente',
      id_producto: (result as any).insertId
    };
  }

  async actualizar(id_producto: number, producto: Partial<Producto>): Promise<{ mensaje: string }> {
    await this.obtenerPorId(id_producto); // Verificar que existe

    const campos: string[] = [];
    const valores: any[] = [];

    if (producto.nombre_producto !== undefined) {
      campos.push('nombre_producto = ?');
      valores.push(producto.nombre_producto);
    }
    if (producto.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(producto.descripcion);
    }
    if (producto.categoria !== undefined) {
      campos.push('categoria = ?');
      valores.push(producto.categoria);
    }
    if (producto.stock !== undefined) {
      campos.push('stock = ?');
      valores.push(producto.stock);
    }
    if (producto.stock_minimo !== undefined) {
      campos.push('stock_minimo = ?');
      valores.push(producto.stock_minimo);
    }
    if (producto.id_proveedor !== undefined) {
      campos.push('id_proveedor = ?');
      valores.push(producto.id_proveedor);
    }

    if (campos.length === 0) {
      throw new AppError('No hay campos para actualizar', 400);
    }

    valores.push(id_producto);

    await pool.query(
      `UPDATE PRODUCTOS SET ${campos.join(', ')} WHERE id_producto = ?`,
      valores
    );

    return { mensaje: 'Producto actualizado exitosamente' };
  }

  async descontarStock(id_producto: number, cantidad: number): Promise<void> {
    const producto = await this.obtenerPorId(id_producto);

    if (producto.stock < cantidad) {
      throw new AppError(
        `Stock insuficiente para el producto ${producto.nombre_producto}. Disponible: ${producto.stock}`,
        400
      );
    }

    await pool.query(
      'UPDATE PRODUCTOS SET stock = stock - ? WHERE id_producto = ?',
      [cantidad, id_producto]
    );
  }

  async aumentarStock(id_producto: number, cantidad: number): Promise<void> {
    await pool.query(
      'UPDATE PRODUCTOS SET stock = stock + ? WHERE id_producto = ?',
      [cantidad, id_producto]
    );
  }

  async eliminar(id_producto: number): Promise<{ mensaje: string }> {
    await this.obtenerPorId(id_producto); // Verificar que existe

    await pool.query('DELETE FROM PRODUCTOS WHERE id_producto = ?', [id_producto]);

    return { mensaje: 'Producto eliminado exitosamente' };
  }
}
