# Komit — Rastreador de Comisiones para Artistas

Komit es una API REST de backend desarrollada con Spring Boot para gestionar comisiones artísticas. Permite llevar el control de clientes, tipos de comisión, hitos, revisiones, pagos y referencias de manera organizada y estructurada. Proyecto universitario para el curso IC-6821 Diseño de Software (TEC).

---

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instaladas las siguientes herramientas en tu sistema:

### Java 21

La aplicación requiere Java 21 o superior. Puedes verificar tu versión actual con:

```bash
java -version
```


**En Windows:**
Descarga el instalador desde [adoptium.net](https://adoptium.net/) y sigue el asistente de instalación.

### Docker y Docker Compose

La base de datos PostgreSQL se ejecuta dentro de un contenedor Docker. Es necesario tener instalados:

- **Docker Engine** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior, incluido en Docker Desktop)

Puedes verificar las versiones con:

```bash
docker --version
docker compose version
```

Si no tienes Docker instalado, descárgalo desde [docker.com](https://www.docker.com/products/docker-desktop/).

### Maven (opcional)

El proyecto incluye el wrapper de Maven (`mvnw`), así que **no es necesario** instalar Maven globalmente. El wrapper descargará automáticamente la versión correcta de Maven la primera vez que lo ejecutes.

Si de todas formas prefieres usar Maven instalado globalmente, puedes descargarlo desde [maven.apache.org](https://maven.apache.org/).

---

## Configuración de la Base de Datos

El proyecto utiliza PostgreSQL 17 corriendo en un contenedor Docker. Toda la configuración ya está lista en el archivo `docker-compose.yml` en la raíz del proyecto.

### Parámetros de conexión (ya configurados en `application.yaml`)

| Parámetro | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `komit` |
| Usuario | `postgres` |
| Contraseña | `postgres` |

### Levantar el contenedor de PostgreSQL

Desde la raíz del proyecto, ejecuta:

```bash
docker compose up -d
```

Para verificar que el contenedor está corriendo correctamente:

```bash
docker compose ps
```

Deberías ver algo similar a esto:

```
NAME                SERVICE    STATUS    PORTS
komit-postgres-1    postgres   running   0.0.0.0:5432->5432/tcp
```

> **Nota:** Hibernate creará automáticamente todas las tablas necesarias la primera vez que arranque la aplicación gracias a la configuración `ddl-auto: update`. No es necesario ejecutar ningún script SQL manualmente.

---

## Ejecutar la Aplicación

Una vez que el contenedor de PostgreSQL esté corriendo, puedes iniciar la aplicación Spring Boot.

### Usando el wrapper de Maven (recomendado)

**En Linux**
```bash
./mvnw spring-boot:run
```

**En Windows (PowerShell):**
```powershell
.\mvnw.cmd spring-boot:run
```

### Usando Maven instalado globalmente

Si tienes Maven instalado en tu sistema:

```bash
mvn spring-boot:run
```

```
Started KomitApplication in X.XXX seconds (process running for X.XXX)
```

---

## Verificar que Todo Funciona

Una vez arrancada la aplicación, puedes hacer una petición de prueba para confirmar que responde correctamente.

### Con curl

```bash
curl http://localhost:8080/api/clients
```

Deberías recibir una respuesta con código HTTP **200** y un arreglo JSON vacío `[]` si no hay clientes registrados.

### Con un cliente HTTP (Postman / Insomnia)

Crea una petición `GET` a:

```
http://localhost:8080/api/clients
```

---

## Documentación de la API (Swagger)

La aplicación incluye una interfaz Swagger UI generada automáticamente que documenta todos los endpoints disponibles y permite probarlos directamente desde el navegador.

Una vez que la aplicación esté corriendo, abre tu navegador y visita:

```
http://localhost:8080/swagger-ui.html
```

Desde ahí podrás:
- Ver todos los endpoints organizados por recurso
- Consultar los esquemas de los DTOs de entrada y salida
- Ejecutar peticiones de prueba directamente desde el navegador

---

## Detener la Aplicación

### Detener Spring Boot

Presiona `Ctrl + C` en la terminal donde está corriendo la aplicación.

### Detener el contenedor de PostgreSQL

```bash
docker compose down
```

Si también quieres eliminar el volumen con los datos almacenados (útil para empezar desde cero):

```bash
docker compose down -v
```
---

## Estructura del Proyecto

```
src/main/java/com/swj/komit/
├── controller/          # Controladores REST — reciben peticiones HTTP
├── service/             # Lógica de negocio
├── repository/          # Acceso a la base de datos (Spring Data JPA)
├── entity/              # Entidades JPA (tablas de la base de datos)
├── dto/
│   ├── request/         # DTOs de entrada (body de peticiones)
│   └── response/        # DTOs de salida (respuestas JSON)
├── mapper/              # Conversión entre entidades y DTOs
├── exception/           # Excepciones personalizadas y manejador global
├── enums/               # Enumeraciones (estados de comisiones, hitos, revisiones)
└── KomitApplication.java
```

---

## Endpoints Disponibles

### Clientes — `/api/clients`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/clients` | Listar todos los clientes |
| `GET` | `/api/clients/{id}` | Obtener cliente por ID |
| `POST` | `/api/clients` | Crear nuevo cliente |
| `PUT` | `/api/clients/{id}` | Actualizar cliente |
| `DELETE` | `/api/clients/{id}` | Eliminar cliente |
| `GET` | `/api/clients/{id}/commissions` | Comisiones de un cliente |

### Tipos de Comisión — `/api/commission-types`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/commission-types` | Listar todos los tipos |
| `GET` | `/api/commission-types/{id}` | Obtener tipo por ID |
| `POST` | `/api/commission-types` | Crear nuevo tipo |
| `PUT` | `/api/commission-types/{id}` | Actualizar tipo |
| `DELETE` | `/api/commission-types/{id}` | Eliminar tipo |

### Comisiones — `/api/commissions`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/commissions` | Listar (filtros: `status`, `clientId`, `deadlineBefore`, `tagId`) |
| `GET` | `/api/commissions/{id}` | Obtener comisión por ID |
| `POST` | `/api/commissions` | Crear comisión (genera hitos automáticamente) |
| `PUT` | `/api/commissions/{id}` | Actualizar comisión |
| `DELETE` | `/api/commissions/{id}` | Eliminar comisión |
| `POST` | `/api/commissions/{id}/cancel` | Cancelar comisión |
| `GET` | `/api/commissions/{id}/balance` | Consultar balance de pagos |

### Hitos — `/api/commissions/{id}/milestones` y `/api/milestones`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/commissions/{commissionId}/milestones` | Hitos de una comisión |
| `POST` | `/api/commissions/{commissionId}/milestones` | Agregar hito |
| `PUT` | `/api/milestones/{id}` | Actualizar hito |
| `DELETE` | `/api/milestones/{id}` | Eliminar hito |
| `POST` | `/api/milestones/{id}/complete` | Marcar hito como completado |

### Revisiones — `/api/milestones/{id}/revisions` y `/api/revisions`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/milestones/{milestoneId}/revisions` | Revisiones de un hito |
| `POST` | `/api/milestones/{milestoneId}/revisions` | Crear revisión |
| `GET` | `/api/revisions/{id}` | Obtener revisión por ID |
| `POST` | `/api/revisions/{id}/address` | Marcar revisión como atendida |
| `POST` | `/api/revisions/{id}/reject` | Rechazar revisión |
| `DELETE` | `/api/revisions/{id}` | Eliminar revisión |

### Pagos — `/api/commissions/{id}/payments` y `/api/payments`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/commissions/{commissionId}/payments` | Pagos de una comisión |
| `POST` | `/api/commissions/{commissionId}/payments` | Registrar pago |
| `GET` | `/api/payments/{id}` | Obtener pago por ID |
| `DELETE` | `/api/payments/{id}` | Eliminar pago |

### Referencias — `/api/commissions/{id}/references` y `/api/references`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/commissions/{commissionId}/references` | Referencias de una comisión |
| `POST` | `/api/commissions/{commissionId}/references` | Agregar referencia |
| `DELETE` | `/api/references/{id}` | Eliminar referencia |

### Etiquetas — `/api/tags` y `/api/commissions/{id}/tags`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/tags` | Listar todas las etiquetas |
| `POST` | `/api/tags` | Crear etiqueta |
| `DELETE` | `/api/tags/{id}` | Eliminar etiqueta |
| `POST` | `/api/commissions/{commissionId}/tags` | Asignar etiqueta a comisión |
| `DELETE` | `/api/commissions/{commissionId}/tags/{tagId}` | Quitar etiqueta de comisión |
