-- =====================================================
-- Script de Inicialización de Datos Base
-- Backend Sistema de Gestión de Ventas
-- =====================================================
-- Este script debe ejecutarse DESPUÉS de importar database.sql
-- Inserta los perfiles de usuario y tipos de pago necesarios
-- =====================================================

USE datos_negocio;

-- =====================================================
-- PERFILES DE USUARIO
-- =====================================================
-- Tabla: PERFIL
-- Descripción: Roles del sistema con diferentes niveles de acceso
-- =====================================================

INSERT INTO PERFIL (rol) VALUES ('Administrador');
INSERT INTO PERFIL (rol) VALUES ('Vendedor');
INSERT INTO PERFIL (rol) VALUES ('Encargado de Stock');

-- Verificar inserción
SELECT * FROM PERFIL;

-- =====================================================
-- TIPOS DE PAGO
-- =====================================================
-- Tabla: TIPOS_PAGO
-- Descripción: Métodos de pago aceptados en el sistema
-- =====================================================

INSERT INTO TIPOS_PAGO (descripcion) VALUES ('Efectivo');
INSERT INTO TIPOS_PAGO (descripcion) VALUES ('Tarjeta de Débito');
INSERT INTO TIPOS_PAGO (descripcion) VALUES ('Tarjeta de Crédito');
INSERT INTO TIPOS_PAGO (descripcion) VALUES ('Transferencia');

-- Verificar inserción
SELECT * FROM TIPOS_PAGO;

-- =====================================================
-- RESUMEN DE DATOS INSERTADOS
-- =====================================================

SELECT 
    '✓ Perfiles creados' as Estado,
    COUNT(*) as Total 
FROM PERFIL
UNION ALL
SELECT 
    '✓ Tipos de pago creados' as Estado,
    COUNT(*) as Total 
FROM TIPOS_PAGO;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 
-- PERFILES:
-- - id_perfil 1: Administrador (acceso total al sistema)
-- - id_perfil 2: Vendedor (registrar ventas y cobros)
-- - id_perfil 3: Encargado de Stock (gestión de inventario)
--
-- TIPOS DE PAGO:
-- - id_tipo_pago 1: Efectivo
-- - id_tipo_pago 2: Tarjeta de Débito
-- - id_tipo_pago 3: Tarjeta de Crédito
-- - id_tipo_pago 4: Transferencia
--
-- Para crear el primer usuario administrador:
-- 1. Ejecutar este script
-- 2. Usar el endpoint: POST /api/auth/registrar
-- 3. Enviar: {"nombre_usuario": "admin", "contraseña_usu": "admin123", "id_perfil": 1}
--
-- =====================================================
