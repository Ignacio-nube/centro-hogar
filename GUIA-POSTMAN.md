# 🚀 Guía Completa de Pruebas con Postman

Esta guía te muestra cómo probar todos los endpoints del backend usando Postman, incluyendo la autenticación JWT.

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Autenticación (Sin crear perfil)](#autenticación)
3. [Configurar Headers Globales](#configurar-headers)
4. [Pruebas por Módulo](#pruebas-por-módulo)
5. [Colección de Variables](#variables-de-entorno)

---

## 🔧 Configuración Inicial

### 1. Iniciar el Servidor

```powershell
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

### 2. Crear un Environment en Postman

1. Click en **Environments** (icono de engranaje)
2. Click en **Create Environment**
3. Nombre: `Backend Local`
4. Agregar variables:

```
Variable       | Initial Value              | Current Value
---------------|----------------------------|---------------------------
base_url       | http://localhost:3000      | http://localhost:3000
token          |                            | (se llenará después)
id_cliente     |                            | (se llenará después)
id_producto    |                            | (se llenará después)
id_venta       |                            | (se llenará después)
```

5. Click en **Save**
6. Seleccionar el environment en el dropdown (esquina superior derecha)

---

## 🔐 Autenticación

### Paso 1: Inicializar Sistema (Primera vez)

**GET** `{{base_url}}/api/auth/inicializar`

**Sin headers, sin body**

**Respuesta esperada:**
```json
{
  "mensaje": "Sistema inicializado correctamente",
  "perfiles_creados": 3,
  "tipos_pago_creados": 4
}
```

> ⚠️ **Importante:** Este endpoint solo debe ejecutarse UNA vez. Crea los perfiles y tipos de pago en la base de datos.

---

### Paso 2: Registrar Usuario Administrador

**POST** `{{base_url}}/api/auth/registrar`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre_usuario": "admin",
  "contraseña_usu": "admin123",
  "id_perfil": 1
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "id_usuario": 1
}
```

> 📝 **Nota:** `id_perfil: 1` = Administrador, `2` = Vendedor, `3` = Encargado de Stock

---

### Paso 3: Login y Obtener Token

**POST** `{{base_url}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre_usuario": "admin",
  "contraseña": "admin123"
}
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "nombre_usuario": "admin",
    "rol": "Administrador"
  }
}
```

**🔑 COPIAR EL TOKEN**

1. Copiar el valor del campo `token` (sin las comillas)
2. Ir a **Environments** → **Backend Local**
3. Pegar en la variable `token` (Current Value)
4. Click en **Save**

---

## 🔒 Configurar Headers Globales

### Opción A: Header Manual (Cada Request)

En cada request, agregar en la pestaña **Headers**:

```
Key              | Value
-----------------|---------------------------
Content-Type     | application/json
Authorization    | Bearer {{token}}
```

### Opción B: Configuración Automática (Recomendado)

1. Click en tu colección de Postman
2. Ir a la pestaña **Authorization**
3. Type: `Bearer Token`
4. Token: `{{token}}`
5. Click en **Save**

Ahora todos los requests heredarán este header automáticamente.

---

## 📦 Pruebas por Módulo

---

## 👥 MÓDULO: CLIENTES

### 1. Crear Cliente

**POST** `{{base_url}}/api/clientes`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "nombre_cliente": "Juan",
  "apellido_cliente": "Pérez",
  "DNI_cliente": "12345678",
  "direccion_cliente": "Av. Siempre Viva 123",
  "telefono_cliente": "555-1234",
  "mail_cliente": "juan.perez@email.com",
  "estado_cliente": "activo"
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Cliente creado exitosamente",
  "id_cliente": 1
}
```

**📌 Guardar `id_cliente` en las variables de entorno**

---

### 2. Obtener Todos los Clientes

**GET** `{{base_url}}/api/clientes`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada:**
```json
[
  {
    "id_cliente": 1,
    "nombre_cliente": "Juan",
    "apellido_cliente": "Pérez",
    "DNI_cliente": "12345678",
    "direccion_cliente": "Av. Siempre Viva 123",
    "telefono_cliente": "555-1234",
    "mail_cliente": "juan.perez@email.com",
    "estado_cliente": "activo"
  }
]
```

---

### 3. Obtener Cliente por ID

**GET** `{{base_url}}/api/clientes/{{id_cliente}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### 4. Verificar Estado de Crédito

**GET** `{{base_url}}/api/clientes/{{id_cliente}}/verificar-credito`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada:**
```json
{
  "puede_credito": true
}
```

---

### 5. Actualizar Cliente

**PUT** `{{base_url}}/api/clientes/{{id_cliente}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "telefono_cliente": "555-9999",
  "mail_cliente": "nuevo.email@email.com"
}
```

---

### 6. Bloquear Cliente

**POST** `{{base_url}}/api/clientes/{{id_cliente}}/bloquear`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### 7. Desbloquear Cliente

**POST** `{{base_url}}/api/clientes/{{id_cliente}}/desbloquear`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### 8. Obtener Historial del Cliente

**GET** `{{base_url}}/api/clientes/{{id_cliente}}/historial`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📦 MÓDULO: PRODUCTOS

### 1. Crear Producto

**POST** `{{base_url}}/api/productos`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "nombre_producto": "Laptop Dell XPS 15",
  "descripcion": "Laptop de alta gama con procesador Intel i7",
  "categoria": "Electrónica",
  "stock": 10,
  "stock_minimo": 3,
  "id_proveedor": null
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Producto creado exitosamente",
  "id_producto": 1
}
```

**📌 Guardar `id_producto` en las variables de entorno**

---

### 2. Obtener Todos los Productos

**GET** `{{base_url}}/api/productos`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### 3. Obtener Producto por ID

**GET** `{{base_url}}/api/productos/{{id_producto}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### 4. Obtener Productos con Bajo Stock

**GET** `{{base_url}}/api/productos/bajo-stock`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada:**
```json
[
  {
    "id_producto": 5,
    "nombre_producto": "Mouse Inalámbrico",
    "stock": 2,
    "stock_minimo": 5
  }
]
```

---

### 5. Obtener Productos por Categoría

**GET** `{{base_url}}/api/productos/categoria/Electrónica`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### 6. Actualizar Producto

**PUT** `{{base_url}}/api/productos/{{id_producto}}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "stock": 15,
  "descripcion": "Laptop actualizada con más RAM"
}
```

---

### 7. Eliminar Producto

**DELETE** `{{base_url}}/api/productos/{{id_producto}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 💰 MÓDULO: VENTAS

### 1. Crear Venta al Contado

**POST** `{{base_url}}/api/ventas`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "id_cliente": 1,
  "id_usuario": 1,
  "tipo_venta": "contado",
  "id_tipo_pago": 1,
  "detalles": [
    {
      "id_producto": 1,
      "cantidad": 2,
      "precio_unitario": 1500.00,
      "usar_precio_credito": false
    }
  ]
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Venta registrada exitosamente",
  "id_venta": 1
}
```

**📌 Guardar `id_venta` en las variables de entorno**

---

### 2. Crear Venta a Crédito

**POST** `{{base_url}}/api/ventas`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "id_cliente": 1,
  "id_usuario": 1,
  "tipo_venta": "credito",
  "id_tipo_pago": 2,
  "detalles": [
    {
      "id_producto": 1,
      "cantidad": 1,
      "precio_unitario": 1500.00,
      "usar_precio_credito": true
    }
  ],
  "plan_pagos": {
    "numero_cuotas": 4,
    "frecuencia": "semanal"
  }
}
```

---

### 3. Obtener Todas las Ventas

**GET** `{{base_url}}/api/ventas`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (opcionales):**
```
fecha_desde=2024-01-01
fecha_hasta=2024-12-31
id_cliente=1
estado=completada
```

---

### 4. Obtener Venta por ID

**GET** `{{base_url}}/api/ventas/{{id_venta}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada:**
```json
{
  "id_venta": 1,
  "fecha_venta": "2024-11-04T10:30:00.000Z",
  "total_venta": 3000.00,
  "estado_venta": "completada",
  "nombre_cliente": "Juan",
  "apellido_cliente": "Pérez",
  "detalles": [
    {
      "id_detalle_venta": 1,
      "id_producto": 1,
      "nombre_producto": "Laptop Dell XPS 15",
      "cantidad": 2,
      "precio_unitario": 1500.00
    }
  ]
}
```

---

### 5. Cancelar Venta

**POST** `{{base_url}}/api/ventas/{{id_venta}}/cancelar`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "motivo": "Cliente solicitó cancelación"
}
```

---

## 💳 MÓDULO: COBRANZAS

### 1. Registrar Pago

**POST** `{{base_url}}/api/cobranzas/registrar-pago`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "id_venta": 1,
  "monto": 500.00,
  "id_tipo_pago": 1
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Pago registrado exitosamente. Saldo restante: $1300.00",
  "id_pago": 1
}
```

---

### 2. Obtener Cuentas por Cobrar

**GET** `{{base_url}}/api/cobranzas/cuentas-por-cobrar`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada:**
```json
[
  {
    "id_venta": 2,
    "fecha_venta": "2024-10-15T14:20:00.000Z",
    "total_venta": 3500.00,
    "nombre_cliente": "María",
    "apellido_cliente": "González",
    "DNI_cliente": "87654321",
    "monto_pagado": 1000.00,
    "saldo_pendiente": 2500.00,
    "dias_mora": 20
  }
]
```

---

### 3. Obtener Cuentas Vencidas (>30 días)

**GET** `{{base_url}}/api/cobranzas/cuentas-vencidas`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### 4. Obtener Estado de Cuenta de Cliente

**GET** `{{base_url}}/api/cobranzas/cliente/{{id_cliente}}`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada:**
```json
{
  "resumen": {
    "total_ventas": 5,
    "total_comprado": 15000.00,
    "total_pagado": 12000.00,
    "saldo_pendiente": 3000.00
  },
  "ventas_pendientes": [
    {
      "id_venta": 3,
      "fecha_venta": "2024-11-01T09:15:00.000Z",
      "total_venta": 2000.00,
      "monto_pagado": 500.00,
      "saldo_pendiente": 1500.00,
      "dias_mora": 3
    }
  ]
}
```

---

### 5. Obtener Historial de Pagos de una Venta

**GET** `{{base_url}}/api/cobranzas/venta/{{id_venta}}/historial`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 🏢 MÓDULO: PROVEEDORES

### 1. Crear Proveedor

**POST** `{{base_url}}/api/proveedores`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "nombre_prov": "Distribuidora TechWorld",
  "direccion_prov": "Calle Industrial 456",
  "contacto_prov": "contacto@techworld.com"
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Proveedor creado exitosamente",
  "id_proveedor": 1
}
```

---

### 2. Obtener Todos los Proveedores

**GET** `{{base_url}}/api/proveedores`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### 3. Obtener Proveedor por ID

**GET** `{{base_url}}/api/proveedores/1`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### 4. Registrar Compra a Proveedor

**POST** `{{base_url}}/api/proveedores/compra`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "id_proveedor": 1,
  "detalles": [
    {
      "id_producto": 1,
      "cantidad": 20,
      "precio_unit": 1200.00
    },
    {
      "id_producto": 2,
      "cantidad": 50,
      "precio_unit": 50.00
    }
  ]
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Compra registrada exitosamente y stock actualizado",
  "id_compra": 1
}
```

> ✅ **El stock se actualiza automáticamente**

---

### 5. Registrar Pago a Proveedor

**POST** `{{base_url}}/api/proveedores/pago`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "id_compra": 1,
  "monto": 10000.00,
  "metodo_pago": "Transferencia"
}
```

---

### 6. Obtener Estado de Cuenta del Proveedor

**GET** `{{base_url}}/api/proveedores/1/estado-cuenta`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

### 7. Obtener Cuentas por Pagar

**GET** `{{base_url}}/api/proveedores/cuentas-por-pagar`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📊 MÓDULO: REPORTES

### 1. Reporte de Ventas

**GET** `{{base_url}}/api/reportes/ventas`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (opcionales):**
```
fecha_desde=2024-01-01
fecha_hasta=2024-12-31
periodo=mes
```

**Valores válidos para `periodo`:** `dia`, `semana`, `mes`, `año`

**Respuesta esperada:**
```json
[
  {
    "fecha": "2024-11-04",
    "total_ventas": 15,
    "monto_total": 45000.00,
    "ventas_completadas": 40000.00,
    "ventas_pendientes": 5000.00,
    "total_cobrado": 38000.00
  }
]
```

---

### 2. Reporte de Cobranzas

**GET** `{{base_url}}/api/reportes/cobranzas`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (opcionales):**
```
fecha_desde=2024-01-01
fecha_hasta=2024-12-31
```

---

### 3. Reporte de Flujo de Efectivo

**GET** `{{base_url}}/api/reportes/flujo-efectivo`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (opcionales):**
```
fecha_desde=2024-01-01
fecha_hasta=2024-12-31
```

**Respuesta esperada:**
```json
{
  "resumen": {
    "total_ingresos": 85000.00,
    "total_egresos": 45000.00,
    "flujo_neto": 40000.00
  },
  "ingresos": [...],
  "egresos": [...],
  "movimientos": [...]
}
```

---

### 4. Reporte de Productos Más Vendidos

**GET** `{{base_url}}/api/reportes/productos-mas-vendidos`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (opcionales):**
```
fecha_desde=2024-01-01
fecha_hasta=2024-12-31
limite=10
```

**Respuesta esperada:**
```json
[
  {
    "id_producto": 1,
    "nombre_producto": "Laptop Dell XPS 15",
    "categoria": "Electrónica",
    "total_vendido": 45,
    "numero_ventas": 30,
    "ingresos_generados": 67500.00
  }
]
```

---

### 5. Reporte de Clientes Top

**GET** `{{base_url}}/api/reportes/clientes-top`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Query Params (opcionales):**
```
fecha_desde=2024-01-01
fecha_hasta=2024-12-31
limite=10
```

---

### 6. Reporte de Inventario

**GET** `{{base_url}}/api/reportes/inventario`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Respuesta esperada:**
```json
{
  "resumen": {
    "total_productos": 150,
    "sin_stock": 5,
    "stock_bajo": 12,
    "stock_normal": 133,
    "total_unidades": 3456
  },
  "productos": [
    {
      "id_producto": 8,
      "nombre_producto": "Teclado Mecánico",
      "categoria": "Accesorios",
      "stock": 0,
      "stock_minimo": 5,
      "proveedor": "Distribuidora TechWorld",
      "estado_stock": "Sin Stock"
    }
  ]
}
```

---

### 7. Reporte de Proveedores

**GET** `{{base_url}}/api/reportes/proveedores`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 🔄 Flujo de Trabajo Completo

### Escenario: Venta Completa

```
1. Inicializar sistema (primera vez)
   POST /api/auth/inicializar

2. Registrar usuario admin
   POST /api/auth/registrar

3. Login y obtener token
   POST /api/auth/login
   → Copiar token a variables de entorno

4. Crear cliente
   POST /api/clientes
   → Guardar id_cliente

5. Crear producto
   POST /api/productos
   → Guardar id_producto

6. Verificar crédito del cliente
   GET /api/clientes/{id}/verificar-credito

7. Crear venta a crédito
   POST /api/ventas
   → Guardar id_venta

8. Registrar pago parcial
   POST /api/cobranzas/registrar-pago

9. Ver estado de cuenta
   GET /api/cobranzas/cliente/{id_cliente}

10. Generar reporte de ventas
    GET /api/reportes/ventas
```

---

## ⚠️ Errores Comunes

### 1. **401 Unauthorized**
```json
{
  "mensaje": "Token no proporcionado"
}
```
**Solución:** Asegúrate de incluir el header `Authorization: Bearer {{token}}`

---

### 2. **401 Token inválido**
```json
{
  "mensaje": "Token inválido"
}
```
**Solución:** El token expiró (24h). Vuelve a hacer login y actualiza el token.

---

### 3. **403 Forbidden**
```json
{
  "mensaje": "No tiene permisos para esta acción"
}
```
**Solución:** Tu usuario no tiene el rol necesario. Usa un usuario Administrador.

---

### 4. **400 DNI ya existe**
```json
{
  "mensaje": "Ya existe un cliente con ese DNI"
}
```
**Solución:** Cambia el DNI o verifica si el cliente ya está creado.

---

### 5. **400 Stock insuficiente**
```json
{
  "mensaje": "Stock insuficiente para el producto Laptop Dell XPS 15. Disponible: 2"
}
```
**Solución:** Reduce la cantidad o registra una compra para aumentar el stock.

---

## 📁 Importar Colección Pre-configurada

Ya existe un archivo `postman_collection.json` en el proyecto con todos los endpoints configurados.

### Importar la colección:

1. Abrir Postman
2. Click en **Import**
3. Seleccionar el archivo `postman_collection.json`
4. Click en **Import**
5. Configurar el environment `Backend Local` como se explicó arriba
6. ¡Listo para probar!

---

## 🎯 Tips de Productividad

### 1. **Tests Automáticos**

Puedes agregar tests en Postman para automatizar verificaciones:

```javascript
// En la pestaña "Tests" de cada request
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.token).to.exist;
    pm.environment.set("token", jsonData.token);
});
```

---

### 2. **Scripts Pre-request**

Para actualizar el token automáticamente:

```javascript
// En la pestaña "Pre-request Script" de la colección
const token = pm.environment.get("token");
if (!token) {
    console.log("No hay token, debes hacer login primero");
}
```

---

### 3. **Exportar Variables**

Después de guardar IDs importantes (id_cliente, id_producto, etc.), exporta el environment:

1. Click en **Environments** → **Backend Local**
2. Click en los tres puntos **...** → **Export**
3. Guardar como `backend-environment.json`

Así puedes compartirlo con tu equipo.

---

## 📞 Contacto y Soporte

Si encuentras problemas:

1. Revisa los logs del servidor en la terminal donde ejecutaste `npm run dev`
2. Verifica que la base de datos esté corriendo
3. Confirma que las variables en `.env` sean correctas
4. Revisa esta guía completa de errores comunes

---

**✅ ¡Listo! Ahora puedes probar todos los endpoints del backend con autenticación JWT.**
