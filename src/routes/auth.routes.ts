import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

// Rutas públicas
router.post('/inicializar', authController.inicializar.bind(authController));
router.post('/login', authController.login.bind(authController));

// Rutas protegidas
router.post('/registrar', authController.registrar.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;
