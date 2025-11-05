# Sistema de Gestión de Ventas - Backend API

Este es el backend completo para el Sistema de Gestión de Ventas desarrollado en TypeScript con Express y MySQL.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```powershell
npm install
```

### 2. Configurar base de datos
```powershell
# Importar el esquema SQL en phpMyAdmin o MySQL
mysql -u root -p datos-negocio < database.sql
```

### 3. Configurar variables de entorno
```powershell
# Copiar archivo de ejemplo
Copy-Item .env.example .env

# Editar .env con tus credenciales
notepad .env
```

### 4. Iniciar servidor de desarrollo
```powershell
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

## 📋 Configuración Inicial

### Crear primer usuario administrador

1. Inicializar perfiles y tipos de pago:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/inicializar" -Method POST
```

2. Registrar usuario administrador:
```powershell
$body = @{
    nombre_usuario = "admin"
    contraseña_usu = "Admin123!"
    id_perfil = 1
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/registrar" -Method POST -Body $body -ContentType "application/json"
```

3. Login:
```powershell
$body = @{
    nombre_usuario = "admin"
    contraseña = "Admin123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = ($response.Content | ConvertFrom-Json).token

Write-Host "Token: $token"
```

## 🔑 Perfiles de Usuario

| ID | Rol | Descripción |
|----|-----|-------------|
| 1 | Administrador | Acceso total al sistema |
| 2 | Vendedor | Ventas y cobranzas |
| 3 | Encargado de Stock | Productos y proveedores |

## 📊 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/registrar` - Registrar usuario (requiere auth)

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes/:id/verificar-credito` - Verificar estado para crédito

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/bajo-stock` - Productos con stock bajo
- `POST /api/productos` - Crear producto

### Ventas
- `POST /api/ventas` - Registrar venta
- `GET /api/ventas/:id` - Detalle de venta
- `POST /api/ventas/:id/cancelar` - Cancelar venta (solo admin)

### Cobranzas
- `GET /api/cobranzas/cuentas-por-cobrar` - Cuentas pendientes
- `GET /api/cobranzas/cuentas-vencidas` - Deudas vencidas
- `POST /api/cobranzas/registrar-pago` - Registrar pago

### Proveedores
- `GET /api/proveedores` - Listar proveedores
- `POST /api/proveedores/compra` - Registrar compra
- `GET /api/proveedores/cuentas-por-pagar` - Cuentas pendientes

### Reportes
- `GET /api/reportes/ventas?periodo=mes` - Reporte de ventas
- `GET /api/reportes/flujo-efectivo` - Flujo de caja
- `GET /api/reportes/inventario` - Estado de inventario

## 🛠 Scripts Disponibles

```powershell
# Desarrollo
npm run dev              # Servidor con hot-reload

# Producción
npm run build            # Compilar TypeScript
npm start                # Iniciar servidor

# Backup
npm run backup           # Backup manual de BD
```

## 📦 Ejemplo: Registrar Venta a Crédito

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$venta = @{
    id_cliente = 1
    tipo_venta = "credito"
    id_tipo_pago = 1
    detalles = @(
        @{
            id_producto = 1
            cantidad = 2
            precio_unitario = 5000
            usar_precio_credito = $true
        }
    )
    plan_pagos = @{
        numero_cuotas = 6
        frecuencia = "mensual"
    }
} | ConvertTo-Json -Depth 3

Invoke-WebRequest -Uri "http://localhost:3000/api/ventas" -Method POST -Headers $headers -Body $venta
```

## ⚙️ Características Implementadas

✅ Autenticación JWT con roles  
✅ CRUD completo de clientes, productos, ventas  
✅ Validación de créditos y bloqueo por mora  
✅ Descuento automático de stock  
✅ Generación de cronogramas de pago  
✅ Registro de pagos parciales  
✅ Gestión de proveedores y compras  
✅ Reportes completos (ventas, cobranzas, inventario)  
✅ Backup de base de datos  
✅ Control de acceso por roles  

## 📚 Documentación Completa

Ver [README.md](README.md) para documentación detallada.

## 🔒 Seguridad

- JWT para autenticación
- Contraseñas cifradas con bcrypt
- Helmet para headers de seguridad
- CORS configurado
- Validación de entradas

## 💾 Base de Datos

La base de datos `datos-negocio` incluye:
- 17 tablas relacionales
- Restricciones de integridad
- Índices optimizados
- Soporte para transacciones

## 🎯 Lógica de Negocio

### Validación de Créditos
- Verificación de DNI obligatorio
- Bloqueo automático por deudas vencidas (>30 días)
- No permite nuevos créditos si tiene mora

### Control de Stock
- Descuento automático al registrar venta
- Devolución automática al cancelar venta
- Entrada automática al registrar compra
- Alertas de stock bajo

### Sistema de Pagos
- Pagos parciales permitidos
- Actualización automática de saldos
- Historial completo de transacciones
- Estados: pendiente, parcial, completado

---

**¿Necesitas ayuda?** Revisa el README.md completo o verifica los logs del servidor.
