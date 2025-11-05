import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ReporteService } from '../services/reporte.service';

const reporteService = new ReporteService();

export class ReporteController {
  async reporteVentas(req: AuthRequest, res: Response) {
    try {
      const filtros = {
        fecha_desde: req.query.fecha_desde as string,
        fecha_hasta: req.query.fecha_hasta as string,
        periodo: req.query.periodo as 'dia' | 'semana' | 'mes' | 'año'
      };

      const reporte = await reporteService.reporteVentas(filtros);
      res.json(reporte);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async reporteCobranzas(req: AuthRequest, res: Response) {
    try {
      const filtros = {
        fecha_desde: req.query.fecha_desde as string,
        fecha_hasta: req.query.fecha_hasta as string
      };

      const reporte = await reporteService.reporteCobranzas(filtros);
      res.json(reporte);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async reporteFlujoEfectivo(req: AuthRequest, res: Response) {
    try {
      const filtros = {
        fecha_desde: req.query.fecha_desde as string,
        fecha_hasta: req.query.fecha_hasta as string
      };

      const reporte = await reporteService.reporteFlujoEfectivo(filtros);
      res.json(reporte);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async reporteProductosMasVendidos(req: AuthRequest, res: Response) {
    try {
      const filtros = {
        fecha_desde: req.query.fecha_desde as string,
        fecha_hasta: req.query.fecha_hasta as string,
        limite: req.query.limite ? parseInt(req.query.limite as string) : 10
      };

      const reporte = await reporteService.reporteProductosMasVendidos(filtros);
      res.json(reporte);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async reporteClientesTop(req: AuthRequest, res: Response) {
    try {
      const filtros = {
        fecha_desde: req.query.fecha_desde as string,
        fecha_hasta: req.query.fecha_hasta as string,
        limite: req.query.limite ? parseInt(req.query.limite as string) : 10
      };

      const reporte = await reporteService.reporteClientesTop(filtros);
      res.json(reporte);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async reporteInventario(req: AuthRequest, res: Response) {
    try {
      const reporte = await reporteService.reporteInventario();
      res.json(reporte);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async reporteProveedores(req: AuthRequest, res: Response) {
    try {
      const reporte = await reporteService.reporteProveedores();
      res.json(reporte);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
