# Komit
Komit es una API REST de backend desarrollada con Spring Boot para gestionar comisiones artísticas. Permite llevar el control de clientes, tipos de comisión, hitos, revisiones, pagos y referencias de manera organizada y estructurada.

## Requisitos Previos

### Java 21
La aplicación requiere Java 21 o superior. Puedes verificar tu versión actual con:

```bash
java -version
```

### Docker y Docker Compose

La base de datos PostgreSQL se ejecuta dentro de un contenedor Docker. Es necesario tener instalados:

- **Docker Engine** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior, incluido en Docker Desktop)

Puedes verificar las versiones con:

```bash
docker --version
docker compose version
```

### Maven (opcional)

El proyecto incluye el wrapper de Maven (`mvnw`), así que no es necesario instalar Maven globalmente. El wrapper descargará automáticamente la versión correcta de Maven la primera vez que lo ejecutes.

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

### Encender el contenedor de PostgreSQL

```bash
docker compose up -d
```

Para verificar que el contenedor está corriendo correctamente:

```bash
docker compose ps
```

Debería salir algo como esto:

```
NAME                SERVICE    STATUS    PORTS
komit-postgres-1    postgres   running   0.0.0.0:5432->5432/tcp
```
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
## Detener la Aplicación

### Detener Spring Boot

Presiona `Ctrl + C` en la terminal donde está corriendo la aplicación.

### Detener el contenedor de PostgreSQL

```bash
docker compose down
```

Si también quieres eliminar el volumen con los datos almacenados:

```bash
docker compose down -v
```
---
