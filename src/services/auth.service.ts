import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { Usuario } from '../models/interfaces';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  async registrarUsuario(datosUsuario: {
    nombre_usuario: string;
    contraseña_usu: string;
    id_perfil: number;
  }): Promise<{ mensaje: string; id_usuario: number }> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Verificar si el usuario ya existe
      const [usuarios] = await connection.query(
        'SELECT id_usuario FROM USUARIO WHERE nombre_usuario = ?',
        [datosUsuario.nombre_usuario]
      );

      if (Array.isArray(usuarios) && usuarios.length > 0) {
        throw new AppError('El nombre de usuario ya existe', 400);
      }

      // Crear registro de login
      const [resultLogin] = await connection.query(
        'INSERT INTO LOGIN (estado_sesion) VALUES (?)',
        ['inactivo']
      );

      const id_login = (resultLogin as any).insertId;

      // Encriptar contraseña
      const contraseñaEncriptada = await bcrypt.hash(datosUsuario.contraseña_usu, 10);

      // Crear usuario
      const [resultUsuario] = await connection.query(
        'INSERT INTO USUARIO (id_login, id_perfil, nombre_usuario, contraseña_usu) VALUES (?, ?, ?, ?)',
        [id_login, datosUsuario.id_perfil, datosUsuario.nombre_usuario, contraseñaEncriptada]
      );

      await connection.commit();

      return {
        mensaje: 'Usuario registrado exitosamente',
        id_usuario: (resultUsuario as any).insertId
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async login(nombre_usuario: string, contraseña: string): Promise<{ token: string; usuario: any }> {
    const connection = await pool.getConnection();
    
    try {
      // Buscar usuario con su perfil
      const [usuarios] = await connection.query(
        `SELECT u.id_usuario, u.nombre_usuario, u.contraseña_usu, u.id_login, 
                p.rol, p.id_perfil
         FROM USUARIO u
         INNER JOIN PERFIL p ON u.id_perfil = p.id_perfil
         WHERE u.nombre_usuario = ?`,
        [nombre_usuario]
      );

      if (!Array.isArray(usuarios) || usuarios.length === 0) {
        throw new AppError('Credenciales inválidas', 401);
      }

      const usuario = usuarios[0] as any;

      // Verificar contraseña
      const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña_usu);

      if (!contraseñaValida) {
        throw new AppError('Credenciales inválidas', 401);
      }

      // Actualizar estado de sesión
      await connection.query(
        'UPDATE LOGIN SET estado_sesion = ? WHERE id_login = ?',
        ['activo', usuario.id_login]
      );

      // Generar token
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          nombre_usuario: usuario.nombre_usuario,
          rol: usuario.rol
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );

      return {
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre_usuario: usuario.nombre_usuario,
          rol: usuario.rol
        }
      };
    } finally {
      connection.release();
    }
  }

  async logout(id_usuario: number): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        `UPDATE LOGIN l
         INNER JOIN USUARIO u ON l.id_login = u.id_login
         SET l.estado_sesion = 'inactivo'
         WHERE u.id_usuario = ?`,
        [id_usuario]
      );
    } finally {
      connection.release();
    }
  }

  async inicializarPerfiles(): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      const perfiles = ['Administrador', 'Vendedor', 'Encargado de Stock'];

      for (const rol of perfiles) {
        await connection.query(
          'INSERT IGNORE INTO PERFIL (rol) VALUES (?)',
          [rol]
        );
      }

      // Crear tipos de pago por defecto
      const tiposPago = ['Efectivo', 'Tarjeta de Débito', 'Tarjeta de Crédito', 'Transferencia'];
      for (const tipo of tiposPago) {
        await connection.query(
          'INSERT IGNORE INTO TIPOS_PAGO (descripcion) VALUES (?)',
          [tipo]
        );
      }
    } finally {
      connection.release();
    }
  }
}
