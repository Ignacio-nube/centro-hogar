import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'datos-negocio';
const DB_HOST = process.env.DB_HOST || 'localhost';
const BACKUP_PATH = process.env.BACKUP_PATH || './backups';

async function crearBackup(): Promise<void> {
  try {
    // Crear directorio de backups si no existe
    await fs.mkdir(BACKUP_PATH, { recursive: true });

    // Generar nombre de archivo con fecha y hora
    const fecha = new Date();
    const nombreArchivo = `backup_${DB_NAME}_${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}_${fecha.getHours().toString().padStart(2, '0')}${fecha.getMinutes().toString().padStart(2, '0')}.sql`;
    const rutaCompleta = path.join(BACKUP_PATH, nombreArchivo);

    // Comando mysqldump (ajustar según tu instalación de MySQL)
    const passwordArg = DB_PASSWORD ? `-p${DB_PASSWORD}` : '';
    const comando = `mysqldump -h ${DB_HOST} -u ${DB_USER} ${passwordArg} ${DB_NAME} > "${rutaCompleta}"`;

    console.log('🔄 Iniciando backup de la base de datos...');

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error al crear backup:', error.message);
        return;
      }

      if (stderr) {
        console.error('⚠️ Advertencia:', stderr);
      }

      console.log(`✅ Backup creado exitosamente: ${nombreArchivo}`);
      
      // Eliminar backups antiguos (mantener solo los últimos 7 días)
      limpiarBackupsAntiguos();
    });
  } catch (error) {
    console.error('❌ Error al crear backup:', error);
  }
}

async function limpiarBackupsAntiguos(): Promise<void> {
  try {
    const archivos = await fs.readdir(BACKUP_PATH);
    const ahora = Date.now();
    const diasRetencion = 7;

    for (const archivo of archivos) {
      if (archivo.startsWith('backup_') && archivo.endsWith('.sql')) {
        const rutaArchivo = path.join(BACKUP_PATH, archivo);
        const stats = await fs.stat(rutaArchivo);
        const diasAntiguedad = (ahora - stats.mtimeMs) / (1000 * 60 * 60 * 24);

        if (diasAntiguedad > diasRetencion) {
          await fs.unlink(rutaArchivo);
          console.log(`🗑️ Backup antiguo eliminado: ${archivo}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error al limpiar backups antiguos:', error);
  }
}

// Ejecutar backup
crearBackup();

// Si se ejecuta como módulo programado, configurar ejecución diaria
if (require.main === module) {
  console.log('📅 Script de backup configurado para ejecución manual');
  console.log('💡 Para backups automáticos, configura un cron job o Task Scheduler');
}
