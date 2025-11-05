-- ---
-- Creación de la Base de Datos
-- ---
CREATE DATABASE IF NOT EXISTS `datos-negocio` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `datos-negocio`;

-- ---
-- Estructura de tabla para la tabla `CLIENTE`
-- ---
CREATE TABLE `CLIENTE` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_cliente` varchar(100) NOT NULL,
  `apellido_cliente` varchar(100) NOT NULL,
  `DNI_cliente` varchar(20) NOT NULL,
  `direccion_cliente` varchar(255) DEFAULT NULL,
  `telefono_cliente` varchar(50) DEFAULT NULL,
  `mail_cliente` varchar(100) DEFAULT NULL,
  `estado_cliente` varchar(20) NOT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `DNI_cliente` (`DNI_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `PROVEEDORES`
-- ---
CREATE TABLE `PROVEEDORES` (
  `id_proveedor` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_prov` varchar(150) NOT NULL,
  `direccion_prov` varchar(255) DEFAULT NULL,
  `contacto_prov` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `PRODUCTOS`
-- ---
CREATE TABLE `PRODUCTOS` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_producto` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 0,
  `id_proveedor` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_proveedor` (`id_proveedor`),
  CONSTRAINT `PRODUCTOS_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `PROVEEDORES` (`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `PRECIO_VENTA`
-- ---
CREATE TABLE `PRECIO_VENTA` (
  `id_precio_venta` int(11) NOT NULL AUTO_INCREMENT,
  `precio_contado` decimal(10,2) NOT NULL,
  `precio_credito` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_precio_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `TIPOS_PAGO`
-- ---
CREATE TABLE `TIPOS_PAGO` (
  `id_tipo_pago` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  PRIMARY KEY (`id_tipo_pago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `PAGO`
-- ---
CREATE TABLE `PAGO` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_tipo_pago` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime NOT NULL,
  `estado` varchar(50) NOT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `id_tipo_pago` (`id_tipo_pago`),
  CONSTRAINT `PAGO_ibfk_1` FOREIGN KEY (`id_tipo_pago`) REFERENCES `TIPOS_PAGO` (`id_tipo_pago`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `DETALLE_PAGO`
-- ---
CREATE TABLE `DETALLE_PAGO` (
  `id_detalle_pago` int(11) NOT NULL AUTO_INCREMENT,
  `id_pago` int(11) NOT NULL,
  `descripcion_detalle_pago` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_detalle_pago`),
  KEY `id_pago` (`id_pago`),
  CONSTRAINT `DETALLE_PAGO_ibfk_1` FOREIGN KEY (`id_pago`) REFERENCES `PAGO` (`id_pago`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `LOGIN`
-- ---
CREATE TABLE `LOGIN` (
  `id_login` int(11) NOT NULL AUTO_INCREMENT,
  `estado_sesion` varchar(50) NOT NULL,
  PRIMARY KEY (`id_login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `PERFIL`
-- ---
CREATE TABLE `PERFIL` (
  `id_perfil` int(11) NOT NULL AUTO_INCREMENT,
  `rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id_perfil`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `USUARIO`
-- ---
CREATE TABLE `USUARIO` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `id_login` int(11) NOT NULL,
  `id_perfil` int(11) NOT NULL,
  `nombre_usuario` varchar(100) NOT NULL,
  `contraseña_usu` varchar(255) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  KEY `id_login` (`id_login`),
  KEY `id_perfil` (`id_perfil`),
  CONSTRAINT `USUARIO_ibfk_1` FOREIGN KEY (`id_login`) REFERENCES `LOGIN` (`id_login`) ON UPDATE CASCADE,
  CONSTRAINT `USUARIO_ibfk_2` FOREIGN KEY (`id_perfil`) REFERENCES `PERFIL` (`id_perfil`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `VENTA`
-- ---
CREATE TABLE `VENTA` (
  `id_venta` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_pago` int(11) NOT NULL,
  `fecha_venta` datetime NOT NULL,
  `total_venta` decimal(10,2) NOT NULL,
  `estado_venta` varchar(50) NOT NULL,
  PRIMARY KEY (`id_venta`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_pago` (`id_pago`),
  CONSTRAINT `VENTA_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `CLIENTE` (`id_cliente`) ON UPDATE CASCADE,
  CONSTRAINT `VENTA_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `USUARIO` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `VENTA_ibfk_3` FOREIGN KEY (`id_pago`) REFERENCES `PAGO` (`id_pago`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `DETALLE_VENTA`
-- ---
CREATE TABLE `DETALLE_VENTA` (
  `id_detalle_venta` int(11) NOT NULL AUTO_INCREMENT,
  `id_venta` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `id_precio_venta` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle_venta`),
  KEY `id_venta` (`id_venta`),
  KEY `id_producto` (`id_producto`),
  KEY `id_precio_venta` (`id_precio_venta`),
  CONSTRAINT `DETALLE_VENTA_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `VENTA` (`id_venta`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `DETALLE_VENTA_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `PRODUCTOS` (`id_producto`) ON UPDATE CASCADE,
  CONSTRAINT `DETALLE_VENTA_ibfk_3` FOREIGN KEY (`id_precio_venta`) REFERENCES `PRECIO_VENTA` (`id_precio_venta`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `DEVOLUCION_VENTA`
-- ---
CREATE TABLE `DEVOLUCION_VENTA` (
  `id_devolucion` int(11) NOT NULL AUTO_INCREMENT,
  `id_venta` int(11) NOT NULL,
  `fecha_dev` datetime NOT NULL,
  `motivo` text DEFAULT NULL,
  `tipo_devolucion` varchar(50) NOT NULL,
  `estado_vta` varchar(50) NOT NULL,
  PRIMARY KEY (`id_devolucion`),
  KEY `id_venta` (`id_venta`),
  CONSTRAINT `DEVOLUCION_VENTA_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `VENTA` (`id_venta`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `DETALLE_DEV_VENTA`
-- ---
CREATE TABLE `DETALLE_DEV_VENTA` (
  `id_detalle_dev` int(11) NOT NULL AUTO_INCREMENT,
  `id_devolucion` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `observacion` text DEFAULT NULL,
  PRIMARY KEY (`id_detalle_dev`),
  KEY `id_devolucion` (`id_devolucion`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `DETALLE_DEV_VENTA_ibfk_1` FOREIGN KEY (`id_devolucion`) REFERENCES `DEVOLUCION_VENTA` (`id_devolucion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `DETALLE_DEV_VENTA_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `PRODUCTOS` (`id_producto`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `COMPRA`
-- ---
CREATE TABLE `COMPRA` (
  `id_compra` int(11) NOT NULL AUTO_INCREMENT,
  `id_proveedor` int(11) NOT NULL,
  `fecha_compra` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(50) NOT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `id_proveedor` (`id_proveedor`),
  CONSTRAINT `COMPRA_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `PROVEEDORES` (`id_proveedor`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `DETALLE_COMPRA`
-- ---
CREATE TABLE `DETALLE_COMPRA` (
  `id_det_compra` int(11) NOT NULL AUTO_INCREMENT,
  `id_compra` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unit` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_det_compra`),
  KEY `id_compra` (`id_compra`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `DETALLE_COMPRA_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `COMPRA` (`id_compra`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `DETALLE_COMPRA_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `PRODUCTOS` (`id_producto`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---
-- Estructura de tabla para la tabla `PAGO_PROVEEDOR`
-- ---
CREATE TABLE `PAGO_PROVEEDOR` (
  `id_pago_prov` int(11) NOT NULL AUTO_INCREMENT,
  `id_compra` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime NOT NULL,
  `metodo_pago` varchar(100) NOT NULL,
  PRIMARY KEY (`id_pago_prov`),
  KEY `id_compra` (`id_compra`),
  CONSTRAINT `PAGO_PROVEEDOR_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `COMPRA` (`id_compra`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;