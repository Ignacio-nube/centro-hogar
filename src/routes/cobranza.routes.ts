import { Router } from 'express';
import { CobranzaController } from '../controllers/cobranza.controller';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();
const cobranzaController = new CobranzaController();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas para consulta (todos los usuarios)
router.get('/cuentas-por-cobrar', cobranzaController.obtenerCuentasPorCobrar.bind(cobranzaController));
router.get('/cuentas-vencidas', cobranzaController.obtenerCuentasVencidas.bind(cobranzaController));
router.get('/cliente/:id_cliente', cobranzaController.obtenerEstadoCuentaCliente.bind(cobranzaController));
router.get('/venta/:id_venta/historial', cobranzaController.obtenerHistorialPagos.bind(cobranzaController));

// Rutas para registro de pagos (Administradores y Vendedores)
router.post('/registrar-pago', verificarRol('Administrador', 'Vendedor'), cobranzaController.registrarPago.bind(cobranzaController));

export default router;
