import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();
const clienteController = new ClienteController();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas para todos los usuarios autenticados
router.get('/', clienteController.obtenerTodos.bind(clienteController));
router.get('/:id', clienteController.obtenerPorId.bind(clienteController));
router.get('/:id/historial', clienteController.obtenerHistorial.bind(clienteController));
router.get('/:id/verificar-credito', clienteController.verificarCredito.bind(clienteController));

// Rutas para Administradores y Vendedores
router.post('/', verificarRol('Administrador', 'Vendedor'), clienteController.crear.bind(clienteController));
router.put('/:id', verificarRol('Administrador', 'Vendedor'), clienteController.actualizar.bind(clienteController));

// Rutas solo para Administradores
router.post('/:id/bloquear', verificarRol('Administrador'), clienteController.bloquear.bind(clienteController));
router.post('/:id/desbloquear', verificarRol('Administrador'), clienteController.desbloquear.bind(clienteController));

export default router;
