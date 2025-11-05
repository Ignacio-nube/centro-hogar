import { Router } from 'express';
import { ProveedorController } from '../controllers/proveedor.controller';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();
const proveedorController = new ProveedorController();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas para consulta (todos los usuarios)
router.get('/', proveedorController.obtenerTodos.bind(proveedorController));
router.get('/cuentas-por-pagar', proveedorController.obtenerCuentasPorPagar.bind(proveedorController));
router.get('/:id', proveedorController.obtenerPorId.bind(proveedorController));
router.get('/:id/estado-cuenta', proveedorController.obtenerEstadoCuenta.bind(proveedorController));

// Rutas para Administradores y Encargado de Stock
router.post('/', verificarRol('Administrador', 'Encargado de Stock'), proveedorController.crear.bind(proveedorController));
router.put('/:id', verificarRol('Administrador', 'Encargado de Stock'), proveedorController.actualizar.bind(proveedorController));
router.post('/compra', verificarRol('Administrador', 'Encargado de Stock'), proveedorController.registrarCompra.bind(proveedorController));
router.post('/pago', verificarRol('Administrador', 'Encargado de Stock'), proveedorController.registrarPago.bind(proveedorController));

export default router;
