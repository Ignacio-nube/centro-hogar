import { Router } from 'express';
import { ReporteController } from '../controllers/reporte.controller';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();
const reporteController = new ReporteController();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Reportes disponibles según rol
router.get('/ventas', verificarRol('Administrador', 'Vendedor'), reporteController.reporteVentas.bind(reporteController));
router.get('/cobranzas', verificarRol('Administrador', 'Vendedor'), reporteController.reporteCobranzas.bind(reporteController));
router.get('/flujo-efectivo', verificarRol('Administrador'), reporteController.reporteFlujoEfectivo.bind(reporteController));
router.get('/productos-mas-vendidos', verificarRol('Administrador'), reporteController.reporteProductosMasVendidos.bind(reporteController));
router.get('/clientes-top', verificarRol('Administrador'), reporteController.reporteClientesTop.bind(reporteController));
router.get('/inventario', verificarRol('Administrador', 'Encargado de Stock'), reporteController.reporteInventario.bind(reporteController));
router.get('/proveedores', verificarRol('Administrador', 'Encargado de Stock'), reporteController.reporteProveedores.bind(reporteController));

export default router;
