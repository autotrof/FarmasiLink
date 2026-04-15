---
name: farmasilink-docker
description: FarmasiLink Laravel project runs inside Docker containers. Use this when working with Docker setup, database connections, or environment configuration for this project.
applyTo: "**"
---

# FarmasiLink Docker & Environment Setup

This project runs in Docker containers. Use these guidelines when working with container operations, database access, or environment configuration.

## Project Structure

- **App Container**: `farmasilink` (PHP 8.4 + Nginx)
- **Database Container**: `farmasilink-db` (MySQL 8.4)
- **Adminer**: `farmasilink-adminer` (Database UI at port 7768)

## Environment Variables

The `.env` file contains all project configuration:

```bash
cat /home/ubuntu/projects/FarmasiLink/.env
```

**Key variables:**
- `APP_ENV=local` — Development environment
- `DB_CONNECTION=mysql` — Uses MySQL database
- `DB_HOST=database` — Docker internal hostname (not `localhost`)
- `DB_DATABASE=farmasilink` — Database name
- `DB_USERNAME=root` — MySQL root user
- `DB_PASSWORD=rootpass` — MySQL root password
- `APP_URL=https://farmasilink.asahskill.com` — Application URL

## Docker Commands

### Access the App Container

Always use the correct user and working directory:

```bash
docker compose exec --user 1000 app bash
```

Or run commands directly:

```bash
docker compose exec --user 1000 app php artisan [command]
```

### Run PHP Commands Inside Docker

Examples:

```bash
# Run migrations
docker compose exec --user 1000 app php artisan migrate

# Run tests
docker compose exec --user 1000 app php artisan test --compact

# Run format check
docker compose exec --user 1000 app vendor/bin/pint --dirty --format agent

# Tinker console
docker compose exec --user 1000 app php artisan tinker
```

## Database Access

### Inside Container

```bash
# Connect to MySQL from container
docker compose exec app mysql -h database -u root -prootpass farmasilink
```

### Via Adminer

Open browser: http://localhost:7768
- Server: `database`
- Username: `root`
- Password: `rootpass`
- Database: `farmasilink`

## Docker Ports

| Service | Port | URL |
|---------|------|-----|
| App (HTTPS) | 7767 | https://localhost:7767 |
| Adminer | 7768 | http://localhost:7768 |

## Timezone

All containers use **Asia/Jakarta** timezone (`TZ=Asia/Jakarta`).

## Container Health

Start/stop the project:

```bash
# Start all containers
docker compose up -d

# Stop all containers
docker compose down

# View logs
docker compose logs -f app

# Rebuild images
docker compose build --no-cache
```

## Important Notes

- Use `--user 1000` flag when executing commands to maintain proper file permissions
- Database hostname is `database` (not `localhost`) inside Docker network
- PHP memory limit is set to 2048M
- Session driver uses files (stored in `/storage/framework/sessions/`)
- All volumes are mounted from the project root (`/home/ubuntu/projects/FarmasiLink`)
