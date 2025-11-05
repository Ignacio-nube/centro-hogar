import { Router } from 'express';
import { VentaController } from '../controllers/venta.controller';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();
const ventaController = new VentaController();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas para consulta (todos los usuarios)
router.get('/', ventaController.obtenerTodas.bind(ventaController));
router.get('/:id', ventaController.obtenerPorId.bind(ventaController));

// Rutas para registro de ventas (Administradores y Vendedores)
router.post('/', verificarRol('Administrador', 'Vendedor'), ventaController.crear.bind(ventaController));

// Rutas solo para Administradores
router.post('/:id/cancelar', verificarRol('Administrador'), ventaController.cancelar.bind(ventaController));

export default router;
