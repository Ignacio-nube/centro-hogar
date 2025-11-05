# 🏪 Sistema de Gestión de Ventas - Backend

Backend completo en TypeScript para un sistema de gestión de ventas, créditos, inventario y proveedores con control basado en roles.

## 📋 Índice

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Roles y Permisos](#roles-y-permisos)
- [Scripts Disponibles](#scripts-disponibles)
- [Backup de Base de Datos](#backup-de-base-de-datos)
- [Ejemplos de Uso](#ejemplos-de-uso)

## ✨ Características

### Funcionalidades Principales

- ✅ **Autenticación y Autorización**
  - Login con JWT
  - Contraseñas cifradas con bcrypt
  - Control de acceso basado en roles (RBAC)

- 👥 **Gestión de Clientes**
  - CRUD completo de clientes
  - Validación de DNI único
  - Bloqueo automático por mora
  - Verificación de estado para créditos
  - Historial de compras

- 📦 **Gestión de Productos**
  - CRUD completo de productos
  - Categorías (muebles, electrodomésticos, colchones)
  - Control de stock automático
  - Alertas de stock bajo
  - Asociación con proveedores

- 💰 **Gestión de Ventas**
  - Registro de ventas al contado y a crédito
  - Descuento automático de stock
  - Generación de cronograma de pagos
  - Validación de cliente para créditos
  - Cancelación de ventas con devolución de stock

- 💳 **Gestión de Cobranzas**
  - Registro de pagos parciales y totales
  - Actualización automática de saldos
  - Cuentas por cobrar
  - Cuentas vencidas
  - Historial de pagos por cliente

- 🏭 **Gestión de Proveedores**
  - CRUD completo de proveedores
  - Registro de compras
  - Entrada automática de stock
  - Pagos a proveedores
  - Cuentas por pagar
  - Estado de cuenta por proveedor

- 📊 **Reportes Completos**
  - Reporte de ventas (día, semana, mes, año)
  - Reporte de cobranzas
  - Flujo de efectivo (ingresos vs egresos)
  - Productos más vendidos
  - Mejores clientes
  - Estado de inventario
  - Análisis de proveedores

## 🛠 Tecnologías

- **Node.js** - Entorno de ejecución
- **TypeScript** - Lenguaje de programación
- **Express** - Framework web
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **dotenv** - Variables de entorno
- **helmet** - Seguridad HTTP
- **cors** - Control de acceso CORS

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v16 o superior)
- **npm** (v7 o superior)
- **MySQL** (v5.7 o superior)
- **phpMyAdmin** (opcional, para gestión visual)

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd c:\Users\nacho\Documents\Trabajo-final\backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la base de datos

Importa el archivo `database.sql` en phpMyAdmin o ejecuta:

```bash
mysql -u root -p < database.sql
```

### 4. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
copy .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de Base de Datos (phpMyAdmin)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=datos-negocio

# Configuración de Seguridad
JWT_SECRET=tu_clave_secreta_muy_segura_cambiala_en_produccion
JWT_EXPIRES_IN=24h

# Configuración de Backup
BACKUP_PATH=./backups
BACKUP_HOUR=2
```

### 5. Inicializar datos básicos

El sistema creará automáticamente los perfiles de usuario y tipos de pago en el primer inicio. También puedes ejecutar:

```bash
# Iniciar el servidor en modo desarrollo
npm run dev
```

Luego hacer una petición POST a `/api/auth/inicializar`

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuración de MySQL
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── cliente.controller.ts
│   │   ├── producto.controller.ts
│   │   ├── venta.controller.ts
│   │   ├── cobranza.controller.ts
│   │   ├── proveedor.controller.ts
│   │   └── reporte.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # Verificación JWT y roles
│   │   └── error.middleware.ts  # Manejo de errores
│   ├── models/
│   │   └── interfaces.ts        # Interfaces TypeScript
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── cliente.routes.ts
│   │   ├── producto.routes.ts
│   │   ├── venta.routes.ts
│   │   ├── cobranza.routes.ts
│   │   ├── proveedor.routes.ts
│   │   └── reporte.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── cliente.service.ts
│   │   ├── producto.service.ts
│   │   ├── venta.service.ts
│   │   ├── cobranza.service.ts
│   │   ├── proveedor.service.ts
│   │   └── reporte.service.ts
│   ├── scripts/
│   │   └── backup.ts            # Script de backup automático
│   ├── app.ts                   # Configuración de Express
│   └── server.ts                # Punto de entrada
├── database.sql                 # Esquema de base de datos
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## 🌐 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/inicializar` | Inicializar perfiles y tipos de pago | No |
| POST | `/login` | Iniciar sesión | No |
| POST | `/registrar` | Registrar nuevo usuario | Sí |
| POST | `/logout` | Cerrar sesión | Sí |

### Clientes (`/api/clientes`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar todos los clientes | Todos |
| GET | `/:id` | Obtener cliente por ID | Todos |
| GET | `/:id/historial` | Historial de compras | Todos |
| GET | `/:id/verificar-credito` | Verificar si puede tener crédito | Todos |
| POST | `/` | Crear nuevo cliente | Admin, Vendedor |
| PUT | `/:id` | Actualizar cliente | Admin, Vendedor |
| POST | `/:id/bloquear` | Bloquear cliente | Admin |
| POST | `/:id/desbloquear` | Desbloquear cliente | Admin |

### Productos (`/api/productos`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar todos los productos | Todos |
| GET | `/:id` | Obtener producto por ID | Todos |
| GET | `/categoria/:categoria` | Productos por categoría | Todos |
| GET | `/bajo-stock` | Productos con stock bajo | Todos |
| POST | `/` | Crear nuevo producto | Admin, Enc. Stock |
| PUT | `/:id` | Actualizar producto | Admin, Enc. Stock |
| DELETE | `/:id` | Eliminar producto | Admin |

### Ventas (`/api/ventas`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar ventas (con filtros) | Todos |
| GET | `/:id` | Obtener venta por ID | Todos |
| POST | `/` | Registrar nueva venta | Admin, Vendedor |
| POST | `/:id/cancelar` | Cancelar venta | Admin |

### Cobranzas (`/api/cobranzas`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/cuentas-por-cobrar` | Listar cuentas pendientes | Todos |
| GET | `/cuentas-vencidas` | Listar cuentas vencidas | Todos |
| GET | `/cliente/:id_cliente` | Estado de cuenta del cliente | Todos |
| GET | `/venta/:id_venta/historial` | Historial de pagos | Todos |
| POST | `/registrar-pago` | Registrar pago | Admin, Vendedor |

### Proveedores (`/api/proveedores`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/` | Listar proveedores | Todos |
| GET | `/:id` | Obtener proveedor por ID | Todos |
| GET | `/:id/estado-cuenta` | Estado de cuenta | Todos |
| GET | `/cuentas-por-pagar` | Cuentas pendientes | Todos |
| POST | `/` | Crear proveedor | Admin, Enc. Stock |
| PUT | `/:id` | Actualizar proveedor | Admin, Enc. Stock |
| POST | `/compra` | Registrar compra | Admin, Enc. Stock |
| POST | `/pago` | Registrar pago | Admin, Enc. Stock |

### Reportes (`/api/reportes`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/ventas` | Reporte de ventas | Admin, Vendedor |
| GET | `/cobranzas` | Reporte de cobranzas | Admin, Vendedor |
| GET | `/flujo-efectivo` | Flujo de caja | Admin |
| GET | `/productos-mas-vendidos` | Top productos | Admin |
| GET | `/clientes-top` | Mejores clientes | Admin |
| GET | `/inventario` | Estado de inventario | Admin, Enc. Stock |
| GET | `/proveedores` | Análisis de proveedores | Admin, Enc. Stock |

## 👤 Roles y Permisos

### Administrador
- Acceso total al sistema
- Gestión de usuarios
- Bloqueo/desbloqueo de clientes
- Cancelación de ventas
- Todos los reportes

### Vendedor
- Gestión de clientes
- Registro de ventas
- Registro de pagos
- Reportes de ventas y cobranzas

### Encargado de Stock
- Gestión de productos
- Gestión de proveedores
- Registro de compras
- Reportes de inventario

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor en modo desarrollo con hot reload

# Producción
npm run build        # Compila TypeScript a JavaScript
npm start            # Inicia servidor en modo producción

# Backup
npm run backup       # Ejecuta backup manual de la base de datos
```

## 💾 Backup de Base de Datos

### Backup Manual

```bash
npm run backup
```

### Backup Automático (Windows)

Crea una tarea programada en Windows:

1. Abre el "Programador de Tareas"
2. Crear tarea básica
3. Configurar para ejecutar diariamente a las 2 AM
4. Acción: "Iniciar un programa"
5. Programa: `node`
6. Argumentos: `dist/scripts/backup.js`
7. Directorio: `C:\Users\nacho\Documents\Trabajo-final\backend`

Los backups se guardan en la carpeta `./backups` y se mantienen por 7 días.

## 📝 Ejemplos de Uso

### 1. Inicializar el Sistema

```bash
POST http://localhost:3000/api/auth/inicializar
```

### 2. Login

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "nombre_usuario": "admin",
  "contraseña": "tu_contraseña"
}
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id_usuario": 1,
    "nombre_usuario": "admin",
    "rol": "Administrador"
  }
}
```

### 3. Crear Cliente

```bash
POST http://localhost:3000/api/clientes
Authorization: Bearer tu_token_jwt
Content-Type: application/json

{
  "nombre_cliente": "Juan",
  "apellido_cliente": "Pérez",
  "DNI_cliente": "12345678",
  "direccion_cliente": "Av. Principal 123",
  "telefono_cliente": "1234567890",
  "mail_cliente": "juan@email.com",
  "estado_cliente": "activo"
}
```

### 4. Registrar Venta a Crédito

```bash
POST http://localhost:3000/api/ventas
Authorization: Bearer tu_token_jwt
Content-Type: application/json

{
  "id_cliente": 1,
  "tipo_venta": "credito",
  "id_tipo_pago": 1,
  "detalles": [
    {
      "id_producto": 1,
      "cantidad": 2,
      "precio_unitario": 5000,
      "usar_precio_credito": true
    }
  ],
  "plan_pagos": {
    "numero_cuotas": 6,
    "frecuencia": "mensual"
  }
}
```

### 5. Registrar Pago

```bash
POST http://localhost:3000/api/cobranzas/registrar-pago
Authorization: Bearer tu_token_jwt
Content-Type: application/json

{
  "id_venta": 1,
  "monto": 2000,
  "id_tipo_pago": 1
}
```

### 6. Consultar Reporte de Ventas

```bash
GET http://localhost:3000/api/reportes/ventas?fecha_desde=2024-01-01&fecha_hasta=2024-12-31&periodo=mes
Authorization: Bearer tu_token_jwt
```

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt (10 rounds)
- Autenticación JWT con expiración configurable
- Middleware helmet para headers de seguridad
- CORS configurado
- Validación de entrada en todas las rutas
- Control de acceso basado en roles

## ⚠️ Notas Importantes

1. **Cambiar JWT_SECRET**: En producción, usa una clave segura y única
2. **Configurar CORS**: Limita los orígenes permitidos en producción
3. **Backups**: Configura backups automáticos diarios
4. **Logs**: Considera agregar un sistema de logging (Winston, Morgan)
5. **Monitoreo**: Implementa monitoreo de rendimiento en producción

## 🐛 Troubleshooting

### Error de conexión a MySQL
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solución**: Verifica credenciales en `.env` y permisos del usuario MySQL

### Puerto en uso
```
Error: listen EADDRINUSE :::3000
```
**Solución**: Cambia el puerto en `.env` o cierra la aplicación que usa el puerto 3000

### Error al compilar TypeScript
```
Error: Cannot find module
```
**Solución**: Ejecuta `npm install` para instalar todas las dependencias

## 📞 Soporte

Para problemas o consultas, revisa:
- La documentación de la API
- Los logs del servidor
- La consola de errores de MySQL

## 📄 Licencia

ISC

---

**Desarrollado con ❤️ usando TypeScript y Express**
