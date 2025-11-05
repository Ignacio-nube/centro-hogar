-- =====================================================
-- Script de Inicialización de Datos Base
-- Backend Sistema de Gestión de Ventas
-- =====================================================
-- Compatible con phpMyAdmin
-- Inserta los perfiles de usuario y tipos de pago necesarios
-- =====================================================

-- Seleccionar la base de datos
USE `datos_negocio`;

-- =====================================================
-- PERFILES DE USUARIO
-- =====================================================

INSERT INTO `PERFIL` (`rol`) VALUES ('Administrador');
INSERT INTO `PERFIL` (`rol`) VALUES ('Vendedor');
INSERT INTO `PERFIL` (`rol`) VALUES ('Encargado de Stock');

-- =====================================================
-- TIPOS DE PAGO
-- =====================================================

INSERT INTO `TIPOS_PAGO` (`descripcion`) VALUES ('Efectivo');
INSERT INTO `TIPOS_PAGO` (`descripcion`) VALUES ('Tarjeta de Débito');
INSERT INTO `TIPOS_PAGO` (`descripcion`) VALUES ('Tarjeta de Crédito');
INSERT INTO `TIPOS_PAGO` (`descripcion`) VALUES ('Transferencia');
INSERT INTO `TIPOS_PAGO` (`descripcion`) VALUES ('Crédito Personal');
