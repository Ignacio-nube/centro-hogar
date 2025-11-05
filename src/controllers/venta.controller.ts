import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { VentaService } from '../services/venta.service';

const ventaService = new VentaService();

export class VentaController {
  async crear(req: AuthRequest, res: Response) {
    try {
      if (!req.usuario) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const datosVenta = {
        ...req.body,
        id_usuario: req.usuario.id_usuario
      };

      const resultado = await ventaService.crear(datosVenta);
      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerPorId(req: AuthRequest, res: Response) {
    try {
      const venta = await ventaService.obtenerPorId(parseInt(req.params.id));
      res.json(venta);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerTodas(req: AuthRequest, res: Response) {
    try {
      const filtros = {
        fecha_desde: req.query.fecha_desde as string,
        fecha_hasta: req.query.fecha_hasta as string,
        id_cliente: req.query.id_cliente ? parseInt(req.query.id_cliente as string) : undefined,
        estado: req.query.estado as string
      };

      const ventas = await ventaService.obtenerTodas(filtros);
      res.json(ventas);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async cancelar(req: AuthRequest, res: Response) {
    try {
      const { motivo } = req.body;
      
      if (!motivo) {
        return res.status(400).json({ error: 'El motivo de cancelación es requerido' });
      }

      const resultado = await ventaService.cancelar(parseInt(req.params.id), motivo);
      res.json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
