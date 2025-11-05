import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CobranzaService } from '../services/cobranza.service';

const cobranzaService = new CobranzaService();

export class CobranzaController {
  async registrarPago(req: AuthRequest, res: Response) {
    try {
      const resultado = await cobranzaService.registrarPago(req.body);
      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerHistorialPagos(req: AuthRequest, res: Response) {
    try {
      const historial = await cobranzaService.obtenerHistorialPagos(parseInt(req.params.id_venta));
      res.json(historial);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerCuentasPorCobrar(req: AuthRequest, res: Response) {
    try {
      const cuentas = await cobranzaService.obtenerCuentasPorCobrar();
      res.json(cuentas);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerCuentasVencidas(req: AuthRequest, res: Response) {
    try {
      const cuentas = await cobranzaService.obtenerCuentasVencidas();
      res.json(cuentas);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerEstadoCuentaCliente(req: AuthRequest, res: Response) {
    try {
      const estadoCuenta = await cobranzaService.obtenerEstadoCuentaCliente(parseInt(req.params.id_cliente));
      res.json(estadoCuenta);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
