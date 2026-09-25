# Laboratorio: Chatbot WhatsApp + PostgreSQL

**Asignatura**: Administración de Bases de Datos

Este laboratorio utiliza una aplicación real (un chatbot de WhatsApp) como
**cliente de PostgreSQL**. El objetivo NO es aprender a programar bots
avanzados, sino practicar administración de PostgreSQL: usuarios, roles,
privilegios, esquemas, integridad referencial, consultas y troubleshooting.

El repositorio está listo para usarse, pero **tú** debes configurar
PostgreSQL, crear la base de datos, el usuario de aplicación y las tablas.
Nada de esto se hace automáticamente.

---

## Misión 1 — Verificar PostgreSQL

Antes de tocar el proyecto, confirma que PostgreSQL está realmente
disponible en tu servidor Ubuntu.

```bash
sudo systemctl status postgresql
sudo ss -tlnp | grep 5432
sudo -u postgres psql -c "SELECT version();"
```

**Preguntas**:
- ¿PostgreSQL está instalado?
- ¿Está funcionando?
- ¿Está escuchando?
- ¿En qué puerto?

Refuerza esta idea clave:

```
INSTALADO ≠ FUNCIONANDO ≠ ESCUCHANDO ≠ ACCESIBLE
```

Un paquete instalado no implica un servicio corriendo; un servicio corriendo
no implica que esté escuchando en la red; y estar escuchando no implica que
sea accesible desde tu aplicación.

---

## Misión 2 — Crear base de datos y usuario

Usando [`sql/01_database.sql`](../sql/01_database.sql) como referencia,
crea:

- La base de datos `chatbot_db`.
- El usuario de aplicación `chatbot_app`, con una contraseña real (no el
  placeholder).

Decide y aplica **solamente** los privilegios necesarios (no le des
superusuario, no le des privilegios de administración).

**Pregunta**: ¿Por qué la aplicación no debería conectarse utilizando el
usuario `postgres`?

---

## Misión 3 — Crear el modelo de datos

Usando [`sql/02_schema.sql`](../sql/02_schema.sql) como referencia, crea las
tablas:

- `usuarios`
- `solicitudes`
- `mensajes`

Identifica en el script:

- `PRIMARY KEY`
- `FOREIGN KEY`
- `UNIQUE`
- `NOT NULL`
- `DEFAULT`

**Pregunta**: ¿Qué ocurriría si intentamos crear una solicitud para un
usuario que no existe? Pruébalo y anota el mensaje de error exacto.

---

## Misión 4 — Configurar la aplicación

Copia el archivo de ejemplo:

```bash
cp .env.example .env
nano .env
```

Completa:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

**Pregunta**: ¿Por qué el archivo `.env` está excluido de Git
(`.gitignore`)?

---

## Misión 5 — Probar Node.js → PostgreSQL

Antes de iniciar WhatsApp, valida la conexión de forma aislada:

```bash
npm run db:test
```

**Resultado esperado**:

```
[DB] Conexión PostgreSQL exitosa.
```

**Pregunta**: ¿Por qué diagnosticar por capas (primero la base de datos,
luego WhatsApp) simplifica el troubleshooting?

---

## Misión 6 — Iniciar WhatsApp

```bash
npm start
```

Escanea el código QR que aparece en la terminal con tu aplicación de
WhatsApp. Espera el mensaje:

```
[WHATSAPP] Cliente listo.
```

Envía al número del bot:

```
!ayuda
```

---

## Misión 7 — Persistencia

Desde WhatsApp, envía:

```
!registrar Pedro González
```

Luego, en `psql`, comprueba directamente en PostgreSQL:

```sql
SELECT * FROM usuarios;
```

Debes observar que un mensaje enviado desde WhatsApp terminó persistido
como una fila dentro de PostgreSQL.

---

## Misión 8 — Relaciones

Desde WhatsApp, envía:

```
!solicitud Problema de acceso
```

Consulta en PostgreSQL la tabla `solicitudes` y observa la columna
`usuario_id`.

Identifica la relación entre `usuarios.id` y `solicitudes.usuario_id`:

```
USUARIO 1 ----- N SOLICITUDES
```

---

## Misión 9 — Consultas

Prueba desde WhatsApp:

```
!perfil
!solicitudes
!estado ID
```

Para cada comando, identifica qué tipo de instrucción SQL ejecuta
internamente el bot: `SELECT`, `INSERT` o `UPDATE`. Revisa el código en
[`src/commands.js`](../src/commands.js) para confirmarlo.

---

## Misión 10 — Troubleshooting

Esta misión **no está automatizada**. El docente provocará uno o más
errores (por ejemplo, deteniendo el servicio, revocando privilegios o
modificando el `.env`).

Sigue la metodología descrita en
[`docs/TROUBLESHOOTING.md`](TROUBLESHOOTING.md):

```
EVIDENCIA → HIPÓTESIS → PRUEBA → RESULTADO → CORRECCIÓN
```

Usa los comandos de diagnóstico (`systemctl`, `ss`, `ps aux`, `journalctl`,
`psql`) para identificar en qué capa está el problema:

```
APLICACIÓN → CONEXIÓN → AUTENTICACIÓN → PERMISOS → BASE DE DATOS → TABLA → CONSULTA
```

No se te entregará la solución exacta de inmediato: se te darán pistas.

---

## Desafío final

En equipo, implementa **una** funcionalidad adicional que utilice
PostgreSQL. Ejemplos posibles:

- `!eliminar ID`
- `!cambiarNombre NuevoNombre`
- `!cerrar ID`
- `!estadisticas`

Tu nuevo comando debe:

- Utilizar PostgreSQL.
- Usar consultas parametrizadas (`$1`, `$2`, ...).
- Respetar las relaciones existentes (por ejemplo, verificar propiedad de
  una solicitud antes de modificarla).
- Manejar errores con `try/catch`.
- Producir una respuesta clara por WhatsApp.

Implementa tu comando en [`src/commands.js`](../src/commands.js), siguiendo
el mismo estilo que los comandos existentes.
