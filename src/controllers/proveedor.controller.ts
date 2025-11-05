import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ProveedorService } from '../services/proveedor.service';

const proveedorService = new ProveedorService();

export class ProveedorController {
  async obtenerTodos(req: AuthRequest, res: Response) {
    try {
      const proveedores = await proveedorService.obtenerTodos();
      res.json(proveedores);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerPorId(req: AuthRequest, res: Response) {
    try {
      const proveedor = await proveedorService.obtenerPorId(parseInt(req.params.id));
      res.json(proveedor);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async crear(req: AuthRequest, res: Response) {
    try {
      const resultado = await proveedorService.crear(req.body);
      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async actualizar(req: AuthRequest, res: Response) {
    try {
      const resultado = await proveedorService.actualizar(parseInt(req.params.id), req.body);
      res.json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async registrarCompra(req: AuthRequest, res: Response) {
    try {
      const resultado = await proveedorService.registrarCompra(req.body);
      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async registrarPago(req: AuthRequest, res: Response) {
    try {
      const resultado = await proveedorService.registrarPagoProveedor(req.body);
      res.json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerEstadoCuenta(req: AuthRequest, res: Response) {
    try {
      const estadoCuenta = await proveedorService.obtenerEstadoCuenta(parseInt(req.params.id));
      res.json(estadoCuenta);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerCuentasPorPagar(req: AuthRequest, res: Response) {
    try {
      const cuentas = await proveedorService.obtenerCuentasPorPagar();
      res.json(cuentas);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
