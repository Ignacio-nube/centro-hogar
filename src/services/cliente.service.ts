import pool from '../config/database';
import { Cliente } from '../models/interfaces';
import { AppError } from '../middleware/error.middleware';

export class ClienteService {
  async obtenerTodos(): Promise<Cliente[]> {
    const [clientes] = await pool.query('SELECT * FROM CLIENTE ORDER BY id_cliente DESC');
    return clientes as Cliente[];
  }

  async obtenerPorId(id_cliente: number): Promise<Cliente> {
    const [clientes] = await pool.query(
      'SELECT * FROM CLIENTE WHERE id_cliente = ?',
      [id_cliente]
    );

    if (!Array.isArray(clientes) || clientes.length === 0) {
      throw new AppError('Cliente no encontrado', 404);
    }

    return clientes[0] as Cliente;
  }

  async obtenerPorDNI(DNI_cliente: string): Promise<Cliente | null> {
    const [clientes] = await pool.query(
      'SELECT * FROM CLIENTE WHERE DNI_cliente = ?',
      [DNI_cliente]
    );

    if (!Array.isArray(clientes) || clientes.length === 0) {
      return null;
    }

    return clientes[0] as Cliente;
  }

  async crear(cliente: Cliente): Promise<{ mensaje: string; id_cliente: number }> {
    // Verificar si el DNI ya existe
    const clienteExistente = await this.obtenerPorDNI(cliente.DNI_cliente);
    
    if (clienteExistente) {
      throw new AppError('Ya existe un cliente con ese DNI', 400);
    }

    const [result] = await pool.query(
      `INSERT INTO CLIENTE (nombre_cliente, apellido_cliente, DNI_cliente, 
       direccion_cliente, telefono_cliente, mail_cliente, estado_cliente)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        cliente.nombre_cliente,
        cliente.apellido_cliente,
        cliente.DNI_cliente,
        cliente.direccion_cliente || null,
        cliente.telefono_cliente || null,
        cliente.mail_cliente || null,
        cliente.estado_cliente || 'activo'
      ]
    );

    return {
      mensaje: 'Cliente creado exitosamente',
      id_cliente: (result as any).insertId
    };
  }

  async actualizar(id_cliente: number, cliente: Partial<Cliente>): Promise<{ mensaje: string }> {
    const clienteExistente = await this.obtenerPorId(id_cliente);

    // Si se está actualizando el DNI, verificar que no exista en otro cliente
    if (cliente.DNI_cliente && cliente.DNI_cliente !== clienteExistente.DNI_cliente) {
      const clienteConDNI = await this.obtenerPorDNI(cliente.DNI_cliente);
      if (clienteConDNI && clienteConDNI.id_cliente !== id_cliente) {
        throw new AppError('Ya existe otro cliente con ese DNI', 400);
      }
    }

    const campos: string[] = [];
    const valores: any[] = [];

    if (cliente.nombre_cliente !== undefined) {
      campos.push('nombre_cliente = ?');
      valores.push(cliente.nombre_cliente);
    }
    if (cliente.apellido_cliente !== undefined) {
      campos.push('apellido_cliente = ?');
      valores.push(cliente.apellido_cliente);
    }
    if (cliente.DNI_cliente !== undefined) {
      campos.push('DNI_cliente = ?');
      valores.push(cliente.DNI_cliente);
    }
    if (cliente.direccion_cliente !== undefined) {
      campos.push('direccion_cliente = ?');
      valores.push(cliente.direccion_cliente);
    }
    if (cliente.telefono_cliente !== undefined) {
      campos.push('telefono_cliente = ?');
      valores.push(cliente.telefono_cliente);
    }
    if (cliente.mail_cliente !== undefined) {
      campos.push('mail_cliente = ?');
      valores.push(cliente.mail_cliente);
    }
    if (cliente.estado_cliente !== undefined) {
      campos.push('estado_cliente = ?');
      valores.push(cliente.estado_cliente);
    }

    if (campos.length === 0) {
      throw new AppError('No hay campos para actualizar', 400);
    }

    valores.push(id_cliente);

    await pool.query(
      `UPDATE CLIENTE SET ${campos.join(', ')} WHERE id_cliente = ?`,
      valores
    );

    return { mensaje: 'Cliente actualizado exitosamente' };
  }

  async bloquearPorMora(id_cliente: number): Promise<{ mensaje: string }> {
    await pool.query(
      'UPDATE CLIENTE SET estado_cliente = ? WHERE id_cliente = ?',
      ['bloqueado', id_cliente]
    );

    return { mensaje: 'Cliente bloqueado por mora' };
  }

  async desbloquear(id_cliente: number): Promise<{ mensaje: string }> {
    await pool.query(
      'UPDATE CLIENTE SET estado_cliente = ? WHERE id_cliente = ?',
      ['activo', id_cliente]
    );

    return { mensaje: 'Cliente desbloqueado exitosamente' };
  }

  async verificarEstadoParaCredito(id_cliente: number): Promise<{ puede_credito: boolean; razon?: string }> {
    const cliente = await this.obtenerPorId(id_cliente);

    if (cliente.estado_cliente === 'bloqueado') {
      return {
        puede_credito: false,
        razon: 'Cliente bloqueado por mora'
      };
    }

    // Verificar si tiene cuotas vencidas
    const [cuotasVencidas] = await pool.query(
      `SELECT COUNT(*) as total
       FROM VENTA v
       WHERE v.id_cliente = ? 
       AND v.estado_venta != 'completada'
       AND v.fecha_venta < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [id_cliente]
    );

    const total = (cuotasVencidas as any[])[0].total;

    if (total > 0) {
      return {
        puede_credito: false,
        razon: 'Cliente tiene deudas vencidas'
      };
    }

    return { puede_credito: true };
  }

  async obtenerHistorial(id_cliente: number): Promise<any> {
    const [ventas] = await pool.query(
      `SELECT v.*, p.estado as estado_pago, p.monto as monto_pagado
       FROM VENTA v
       LEFT JOIN PAGO p ON v.id_pago = p.id_pago
       WHERE v.id_cliente = ?
       ORDER BY v.fecha_venta DESC`,
      [id_cliente]
    );

    return ventas;
  }
}
