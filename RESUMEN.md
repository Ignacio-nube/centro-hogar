# 📦 Backend - Sistema de Gestión de Ventas

## ✨ Resumen Ejecutivo

Backend completo desarrollado en **TypeScript** con **Express** y **MySQL** para gestionar ventas, créditos, inventario y proveedores. Sistema modular con autenticación JWT, control de roles y automatización de procesos críticos.

## 🎯 Características Principales

### ✅ Implementado
- **Autenticación segura** con JWT y bcrypt
- **Control de acceso** basado en roles (Admin, Vendedor, Encargado Stock)
- **Gestión de clientes** con validación DNI y bloqueo por mora
- **Gestión de productos** con control automático de stock
- **Ventas al contado y a crédito** con cronograma de pagos
- **Sistema de cobranzas** con pagos parciales
- **Gestión de proveedores** y compras con entrada automática de stock
- **7 tipos de reportes** (ventas, cobranzas, flujo $, inventario, etc.)
- **Backup automático** de base de datos
- **Arquitectura en capas** (Routes → Controllers → Services → DB)

## 🚀 Inicio Rápido

```powershell
# 1. Instalar dependencias
npm install

# 2. Configurar .env
Copy-Item .env.example .env
notepad .env  # Editar credenciales

# 3. Importar base de datos
mysql -u root -p datos-negocio < database.sql

# 4. Iniciar servidor
npm run dev
```

## 📊 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración BD
│   ├── controllers/     # Controladores (7)
│   ├── middleware/      # Auth y errores
│   ├── models/          # Interfaces TypeScript
│   ├── routes/          # Rutas API (7)
│   ├── services/        # Lógica de negocio (7)
│   └── scripts/         # Backup automático
├── database.sql         # Esquema completo
├── package.json
├── tsconfig.json
└── [4 guías de documentación]
```

## 🌐 API REST

**Base URL:** `http://localhost:3000/api`

### Módulos Disponibles
- `/auth` - Autenticación (login, registro, logout)
- `/clientes` - CRUD + validaciones + historial
- `/productos` - CRUD + stock + categorías
- `/ventas` - Registro contado/crédito + cancelación
- `/cobranzas` - Pagos + cuentas por cobrar + vencidas
- `/proveedores` - CRUD + compras + pagos
- `/reportes` - 7 tipos de reportes con filtros

## 🔐 Seguridad

- ✅ JWT con expiración configurable
- ✅ Contraseñas cifradas (bcrypt 10 rounds)
- ✅ Helmet (headers de seguridad)
- ✅ CORS configurado
- ✅ Validación de entrada
- ✅ Control de acceso por roles

## 💡 Lógica de Negocio Crítica

### Validación de Créditos
- Requiere DNI obligatorio
- Valida estado del cliente (activo/bloqueado)
- Verifica mora (>30 días)
- Impide nuevos créditos si tiene deudas vencidas

### Control Automático de Stock
- **Venta:** Descuenta stock automáticamente
- **Cancelación:** Devuelve stock
- **Compra:** Aumenta stock
- **Alertas:** Stock bajo (≤ mínimo)

### Sistema de Pagos
- Pagos parciales permitidos
- Actualización automática de saldos
- Estados: pendiente → parcial → completado
- Historial completo de transacciones

## 📈 Reportes Incluidos

1. **Ventas:** Por período (día/semana/mes/año)
2. **Cobranzas:** Detalle de pagos
3. **Flujo de Efectivo:** Ingresos vs Egresos
4. **Productos Top:** Más vendidos
5. **Clientes Top:** Mejores compradores
6. **Inventario:** Estado completo + alertas
7. **Proveedores:** Análisis de compras

## 🛠 Tecnologías

| Categoría | Tecnología |
|-----------|-----------|
| Lenguaje | TypeScript 5.3 |
| Runtime | Node.js 16+ |
| Framework | Express 4.18 |
| Base de Datos | MySQL 5.7+ |
| Auth | JWT + bcrypt |
| Seguridad | Helmet + CORS |

## 📚 Documentación Disponible

1. **README.md** (15 páginas)
   - Documentación completa
   - Todos los endpoints
   - Ejemplos de uso
   
2. **INSTALACION-WINDOWS.md** (8 páginas)
   - Guía paso a paso para Windows
   - Solución de problemas
   - Configuración de backups

3. **INICIO-RAPIDO.md** (4 páginas)
   - Setup rápido
   - Comandos PowerShell
   - Ejemplos prácticos

4. **ARQUITECTURA.md** (6 páginas)
   - Diagramas de flujo
   - Estructura de capas
   - Matriz de permisos

## 🎮 Scripts Disponibles

```powershell
npm run dev      # Desarrollo con hot-reload
npm run build    # Compilar TypeScript
npm start        # Producción
npm run backup   # Backup manual de BD
```

## 🔧 Configuración Mínima

### .env
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=datos-negocio
JWT_SECRET=clave_segura_aqui
```

### Base de Datos
- MySQL 5.7 o superior
- 17 tablas relacionales
- Integridad referencial
- Índices optimizados

## 📦 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `database.sql` | Esquema completo de BD |
| `postman_collection.json` | Colección de pruebas |
| `setup.ps1` | Script de instalación automática |
| `.env.example` | Plantilla de configuración |

## 🎯 Casos de Uso Principales

### 1. Registrar Venta a Crédito
```typescript
POST /api/ventas
- Valida cliente (DNI, estado, mora)
- Verifica stock disponible
- Crea venta + detalles
- Descuenta stock automáticamente
- Genera cronograma de pagos
```

### 2. Registrar Pago
```typescript
POST /api/cobranzas/registrar-pago
- Actualiza saldo pendiente
- Registra en historial
- Cambia estado si está completo
```

### 3. Entrada de Mercadería
```typescript
POST /api/proveedores/compra
- Registra compra
- Aumenta stock automáticamente
- Crea cuenta por pagar
```

## 🔒 Roles y Permisos

### Administrador
✅ Acceso total
✅ Gestión de usuarios
✅ Cancelación de ventas
✅ Todos los reportes

### Vendedor
✅ Clientes
✅ Ventas
✅ Cobranzas
✅ Reportes de ventas

### Encargado de Stock
✅ Productos
✅ Proveedores
✅ Compras
✅ Reportes de inventario

## 🐛 Troubleshooting Rápido

**Error de conexión MySQL:**
→ Verifica credenciales en `.env`

**Puerto en uso:**
→ Cambia `PORT` en `.env`

**Módulo no encontrado:**
→ Ejecuta `npm install`

**Error al compilar:**
→ Verifica `tsconfig.json`

## 📞 Soporte

- Ver `README.md` para documentación completa
- Ver `INSTALACION-WINDOWS.md` para guía de instalación
- Revisar logs del servidor en consola
- Verificar logs de MySQL

## ✅ Estado del Proyecto

| Componente | Estado |
|------------|--------|
| Autenticación | ✅ Completo |
| Clientes | ✅ Completo |
| Productos | ✅ Completo |
| Ventas | ✅ Completo |
| Cobranzas | ✅ Completo |
| Proveedores | ✅ Completo |
| Reportes | ✅ Completo |
| Backup | ✅ Completo |
| Tests | ⏳ Pendiente |
| Docker | ⏳ Pendiente |

## 🚦 Próximos Pasos Sugeridos

1. ⏳ Tests unitarios (Jest)
2. ⏳ Tests de integración
3. ⏳ Logs con Winston
4. ⏳ Documentación Swagger
5. ⏳ Containerización Docker
6. ⏳ CI/CD Pipeline
7. ⏳ Monitoreo de performance

## 📊 Métricas del Código

- **Archivos TypeScript:** 28
- **Líneas de código:** ~3,500
- **Endpoints:** 45+
- **Tablas BD:** 17
- **Servicios:** 7
- **Controllers:** 7
- **Rutas:** 7

## 🎓 Conceptos Implementados

- ✅ Arquitectura en capas
- ✅ Patrón Repository
- ✅ Inyección de dependencias
- ✅ SOLID principles
- ✅ RESTful API
- ✅ Transacciones de BD
- ✅ Middleware pattern
- ✅ Error handling
- ✅ JWT authentication
- ✅ Role-based access control

## 💾 Base de Datos

**Nombre:** `datos-negocio`
**Tablas principales:** 17
**Relaciones:** 15+ foreign keys
**Performance:** < 3 segundos por query

### Tablas Clave
- CLIENTE (con validación DNI)
- PRODUCTO (con control stock)
- VENTA + DETALLE_VENTA
- PAGO + DETALLE_PAGO
- PROVEEDOR + COMPRA
- USUARIO + PERFIL + LOGIN

## 🌟 Destacados

✨ **Automatización total** del stock
✨ **Validaciones de negocio** en capa de servicios
✨ **Seguridad robusta** con JWT y bcrypt
✨ **Reportes completos** con filtros flexibles
✨ **Código modular** y mantenible
✨ **Documentación exhaustiva**
✨ **TypeScript** con tipado fuerte

---

## 📄 Licencia

ISC

## 👨‍💻 Desarrollo

Desarrollado con ❤️ usando TypeScript, Express y MySQL para el Sistema de Gestión de Ventas.

**Versión:** 1.0.0  
**Fecha:** Noviembre 2024

---

**¿Listo para empezar?**

```powershell
# Ejecuta el script de setup automático
.\setup.ps1

# O sigue la guía de instalación
notepad INSTALACION-WINDOWS.md
```
