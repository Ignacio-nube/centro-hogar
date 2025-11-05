import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async registrar(req: AuthRequest, res: Response) {
    try {
      const resultado = await authService.registrarUsuario(req.body);
      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const { nombre_usuario, contraseña } = req.body;
      
      if (!nombre_usuario || !contraseña) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
      }

      const resultado = await authService.login(nombre_usuario, contraseña);
      res.json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      await authService.logout(req.usuario.id_usuario);
      res.json({ mensaje: 'Sesión cerrada exitosamente' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async inicializar(req: AuthRequest, res: Response) {
    try {
      await authService.inicializarPerfiles();
      res.json({ mensaje: 'Perfiles y tipos de pago inicializados' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
