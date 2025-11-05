# Script de configuración automática para el backend
# Sistema de Gestión de Ventas

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Sistema de Gestión de Ventas - Setup Script   " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js no encontrado. Por favor instálalo desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar npm
Write-Host "2. Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm no encontrado" -ForegroundColor Red
    exit 1
}

# Instalar dependencias
Write-Host ""
Write-Host "3. Instalando dependencias del proyecto..." -ForegroundColor Yellow
Write-Host "   (Esto puede tardar varios minutos...)" -ForegroundColor Gray
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

# Crear archivo .env si no existe
Write-Host ""
Write-Host "4. Configurando variables de entorno..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "   ✅ Archivo .env creado desde .env.example" -ForegroundColor Green
    Write-Host "   ⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales de MySQL" -ForegroundColor Yellow
    Write-Host "      Archivo ubicado en: $(Get-Location)\.env" -ForegroundColor Gray
} else {
    Write-Host "   ℹ️  Archivo .env ya existe" -ForegroundColor Cyan
}

# Crear carpeta de backups
Write-Host ""
Write-Host "5. Creando carpeta de backups..." -ForegroundColor Yellow
if (-not (Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" | Out-Null
    Write-Host "   ✅ Carpeta backups creada" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Carpeta backups ya existe" -ForegroundColor Cyan
}

# Compilar TypeScript
Write-Host ""
Write-Host "6. Compilando TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Proyecto compilado correctamente" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Advertencia: Hay errores de compilación (normal si no has configurado .env)" -ForegroundColor Yellow
    Write-Host "      Los errores se resolverán después de configurar .env" -ForegroundColor Gray
}

# Resumen
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "              CONFIGURACIÓN COMPLETADA            " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configura la base de datos:" -ForegroundColor White
Write-Host "   • Importa database.sql en phpMyAdmin" -ForegroundColor Gray
Write-Host "   • O ejecuta: mysql -u root -p datos-negocio < database.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configura las variables de entorno:" -ForegroundColor White
Write-Host "   • Edita el archivo .env" -ForegroundColor Gray
Write-Host "   • Configura DB_USER, DB_PASSWORD, JWT_SECRET" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Inicia el servidor:" -ForegroundColor White
Write-Host "   • Desarrollo: npm run dev" -ForegroundColor Gray
Write-Host "   • Producción: npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Inicializa el sistema:" -ForegroundColor White
Write-Host "   POST http://localhost:3000/api/auth/inicializar" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentación completa en:" -ForegroundColor Yellow
Write-Host "   • README.md" -ForegroundColor Gray
Write-Host "   • INSTALACION-WINDOWS.md" -ForegroundColor Gray
Write-Host "   • INICIO-RAPIDO.md" -ForegroundColor Gray
Write-Host ""
Write-Host "¿Quieres abrir el archivo .env para editarlo? (S/N): " -ForegroundColor Yellow -NoNewline
$respuesta = Read-Host
if ($respuesta -eq "S" -or $respuesta -eq "s") {
    notepad .env
}
Write-Host ""
Write-Host "✨ ¡Setup completado! Buena suerte con tu proyecto." -ForegroundColor Green
