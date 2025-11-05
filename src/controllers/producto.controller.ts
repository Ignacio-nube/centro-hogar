import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ProductoService } from '../services/producto.service';

const productoService = new ProductoService();

export class ProductoController {
  async obtenerTodos(req: AuthRequest, res: Response) {
    try {
      const productos = await productoService.obtenerTodos();
      res.json(productos);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerPorId(req: AuthRequest, res: Response) {
    try {
      const producto = await productoService.obtenerPorId(parseInt(req.params.id));
      res.json(producto);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerPorCategoria(req: AuthRequest, res: Response) {
    try {
      const productos = await productoService.obtenerPorCategoria(req.params.categoria);
      res.json(productos);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async obtenerBajoStock(req: AuthRequest, res: Response) {
    try {
      const productos = await productoService.obtenerBajoStock();
      res.json(productos);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async crear(req: AuthRequest, res: Response) {
    try {
      const resultado = await productoService.crear(req.body);
      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async actualizar(req: AuthRequest, res: Response) {
    try {
      const resultado = await productoService.actualizar(parseInt(req.params.id), req.body);
      res.json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async eliminar(req: AuthRequest, res: Response) {
    try {
      const resultado = await productoService.eliminar(parseInt(req.params.id));
      res.json(resultado);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
