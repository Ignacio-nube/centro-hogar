import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import clienteRoutes from './routes/cliente.routes';
import productoRoutes from './routes/producto.routes';
import ventaRoutes from './routes/venta.routes';
import cobranzaRoutes from './routes/cobranza.routes';
import proveedorRoutes from './routes/proveedor.routes';
import reporteRoutes from './routes/reporte.routes';

import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Application = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Middlewares de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    mensaje: '🚀 API Sistema de Gestión de Ventas',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      clientes: '/api/clientes',
      productos: '/api/productos',
      ventas: '/api/ventas',
      cobranzas: '/api/cobranzas',
      proveedores: '/api/proveedores',
      reportes: '/api/reportes'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/cobranzas', cobranzaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/reportes', reporteRoutes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export default app;
