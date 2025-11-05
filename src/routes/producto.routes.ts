import { Router } from 'express';
import { ProductoController } from '../controllers/producto.controller';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();
const productoController = new ProductoController();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas para todos los usuarios autenticados
router.get('/', productoController.obtenerTodos.bind(productoController));
router.get('/bajo-stock', productoController.obtenerBajoStock.bind(productoController));
router.get('/categoria/:categoria', productoController.obtenerPorCategoria.bind(productoController));
router.get('/:id', productoController.obtenerPorId.bind(productoController));

// Rutas para Administradores y Encargado de Stock
router.post('/', verificarRol('Administrador', 'Encargado de Stock'), productoController.crear.bind(productoController));
router.put('/:id', verificarRol('Administrador', 'Encargado de Stock'), productoController.actualizar.bind(productoController));
router.delete('/:id', verificarRol('Administrador'), productoController.eliminar.bind(productoController));

export default router;
