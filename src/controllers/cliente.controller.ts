import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClienteService } from '../services/cliente.service';

const clienteService = new ClienteService();

export class ClienteController {
  async obtenerTodos(req: AuthRequest, res: Response) {
    try {
      const clientes = await clienteService.obtenerTodos();
      res.json(clientes);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerPorId(req: AuthRequest, res: Response) {
    try {
      const cliente = await clienteService.obtenerPorId(parseInt(req.params.id));
      res.json(cliente);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async crear(req: AuthRequest, res: Response) {
    try {
      const resultado = await clienteService.crear(req.body);
      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async actualizar(req: AuthRequest, res: Response) {
    try {
      const resultado = await clienteService.actualizar(parseInt(req.params.id), req.body);
      res.json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async bloquear(req: AuthRequest, res: Response) {
    try {
      const resultado = await clienteService.bloquearPorMora(parseInt(req.params.id));
      res.json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async desbloquear(req: AuthRequest, res: Response) {
    try {
      const resultado = await clienteService.desbloquear(parseInt(req.params.id));
      res.json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async verificarCredito(req: AuthRequest, res: Response) {
    try {
      const resultado = await clienteService.verificarEstadoParaCredito(parseInt(req.params.id));
      res.json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerHistorial(req: AuthRequest, res: Response) {
    try {
      const historial = await clienteService.obtenerHistorial(parseInt(req.params.id));
      res.json(historial);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
