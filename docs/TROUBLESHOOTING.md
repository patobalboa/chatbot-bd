# Guía de Troubleshooting

Esta guía enseña una **metodología**, no una lista de soluciones mágicas.
El objetivo es que aprendas a diagnosticar problemas por capas, en lugar de
cambiar configuraciones al azar.

## Metodología general

```
EVIDENCIA
    ↓
HIPÓTESIS
    ↓
PRUEBA
    ↓
RESULTADO
    ↓
CORRECCIÓN
```

1. **Evidencia**: ¿qué mensaje de error exacto aparece? ¿en consola o en
   WhatsApp?
2. **Hipótesis**: ¿qué capa podría estar fallando? (ver diagrama de capas)
3. **Prueba**: ejecutar un comando de diagnóstico concreto para confirmar
   o descartar la hipótesis.
4. **Resultado**: ¿la prueba confirmó el problema?
5. **Corrección**: aplicar el cambio mínimo necesario y volver a probar.

**No cambies configuraciones aleatoriamente.** Cada cambio debe estar
justificado por evidencia recolectada en el paso anterior.

## Capas a investigar, en orden

```
APLICACIÓN
    ↓
CONEXIÓN
    ↓
AUTENTICACIÓN
    ↓
PERMISOS
    ↓
BASE DE DATOS
    ↓
TABLA
    ↓
CONSULTA
```

## Comandos de diagnóstico útiles

```bash
# ¿El servicio de PostgreSQL está corriendo?
sudo systemctl status postgresql

# ¿Está escuchando en el puerto esperado?
sudo ss -tlnp | grep 5432

# ¿Qué procesos de PostgreSQL existen?
ps aux | grep postgres

# Logs del sistema / del servicio
journalctl -u postgresql --since "10 min ago"

# Conexión manual para aislar el problema de Node.js
psql -h localhost -U chatbot_app -d chatbot_db
```

## Casos comunes

### 1. PostgreSQL detenido

**Síntoma**: el bot no arranca, `npm run db:test` falla inmediatamente.
**Evidencia**: revisar el mensaje de error en consola.
**Hipótesis**: el servicio no está corriendo.
**Comando para comprobar**: `sudo systemctl status postgresql`
**Pista**: si el estado no es `active (running)`, ahí está el problema.

### 2. Puerto incorrecto

**Síntoma**: error de conexión rechazada.
**Evidencia**: `ECONNREFUSED` en consola.
**Hipótesis**: PostgreSQL no escucha en el puerto configurado en `.env`.
**Comando para comprobar**: `sudo ss -tlnp | grep 5432`
**Pista**: compara el puerto real con `DB_PORT` en tu `.env`.

### 3. Password incorrecta

**Síntoma**: el bot no conecta, pero PostgreSQL sí está corriendo.
**Evidencia**: mensaje `password authentication failed for user "chatbot_app"`.
**Hipótesis**: `DB_PASSWORD` en `.env` no coincide con la contraseña real.
**Comando para comprobar**: intentar `psql -h localhost -U chatbot_app -d chatbot_db`
**Pista**: revisa que copiaste la contraseña correcta al crear el usuario.

### 4. Usuario inexistente

**Síntoma**: falla la autenticación.
**Evidencia**: mensaje de error mencionando el rol.
**Hipótesis**: el usuario `chatbot_app` no fue creado, o se escribió mal.
**Comando para comprobar**: `\du` dentro de `psql` (conectado como `postgres`).
**Pista**: revisa `sql/01_database.sql`.

### 5. Base inexistente

**Síntoma**: error al conectar.
**Evidencia**: mensaje `database "chatbot_db" does not exist`.
**Hipótesis**: la base nunca se creó, o `DB_NAME` está mal escrito.
**Comando para comprobar**: `\l` dentro de `psql`.
**Pista**: revisa `sql/01_database.sql` y el valor de `DB_NAME` en `.env`.

### 6. Tabla inexistente

**Síntoma**: el bot conecta, pero un comando falla.
**Evidencia**: mensaje `relation "usuarios" does not exist`.
**Hipótesis**: no se ejecutó `sql/02_schema.sql`.
**Comando para comprobar**: `\dt` dentro de `psql`, conectado a `chatbot_db`.
**Pista**: ¿estás conectado a la base de datos correcta?

### 7. Falta de privilegios

**Síntoma**: la conexión funciona, pero las consultas fallan.
**Evidencia**: mensaje `permission denied for table usuarios`.
**Hipótesis**: al usuario `chatbot_app` le falta algún `GRANT`.
**Comando para comprobar**: revisar los `GRANT` aplicados en `sql/02_schema.sql`.
**Pista**: recuerda otorgar también privilegios sobre las secuencias (`SERIAL`).

### 8. Variables .env incorrectas

**Síntoma**: comportamiento inconsistente o inesperado.
**Evidencia**: comparar valores reales de PostgreSQL contra el archivo `.env`.
**Hipótesis**: algún valor (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME`) no
coincide con la configuración real.
**Comando para comprobar**: `cat .env` (con cuidado de no compartir la
contraseña) y compararlo con lo verificado en los pasos anteriores.

### 9. WhatsApp no autenticado

**Síntoma**: el QR se genera una y otra vez, o el bot nunca llega a "Cliente
listo".
**Evidencia**: revisar eventos `qr`, `authenticated`, `auth_failure` en consola.
**Hipótesis**: la sesión guardada en `.wwebjs_auth/` está corrupta, o no se
escaneó el QR a tiempo.
**Pista**: probar borrando la carpeta `.wwebjs_auth/` y volviendo a escanear.

### 10. Problemas de Chromium/Puppeteer en Ubuntu

**Síntoma**: el bot falla al iniciar, antes incluso de mostrar el QR.
**Evidencia**: errores relacionados con Chromium, sandbox o librerías
faltantes.
**Hipótesis**: faltan dependencias del sistema operativo que Chromium
necesita para ejecutarse en un servidor sin interfaz gráfica.

```bash
sudo apt update
sudo apt install -y \
  libasound2t64 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6
```

## Errores comunes y qué capa investigar

| Error                                  | Capa a investigar |
|-----------------------------------------|--------------------|
| `ECONNREFUSED`                         | Conexión / servicio detenido / puerto |
| `password authentication failed`       | Autenticación |
| `permission denied for table ...`      | Permisos |
| `database ... does not exist`          | Base de datos |
| `relation ... does not exist`          | Tabla / esquema |
