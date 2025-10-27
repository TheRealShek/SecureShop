# EC2 Docker Deployment Commands

## Quick Start

```bash
# Build and start (one command)
export BUILDX_NO_DEFAULT_ATTESTATIONS=1 && \
docker compose --env-file .env.production build --progress=plain && \
docker compose --env-file .env.production up -d
```

## Individual Commands

### Build
```bash
export BUILDX_NO_DEFAULT_ATTESTATIONS=1
docker compose --env-file .env.production build --progress=plain
```

### Start
```bash
docker compose --env-file .env.production up -d
```

### Check Status
```bash
docker compose ps
```

## Management

### Logs
```bash
docker compose logs -f              # All logs
docker compose logs -f backend      # Backend only
docker compose logs -f frontend     # Frontend only
```

### Control
```bash
docker compose restart              # Restart containers
docker compose down                 # Stop containers
docker compose --env-file .env.production up -d --build  # Rebuild & restart
```

## Notes

- `BUILDX_NO_DEFAULT_ATTESTATIONS=1` prevents provenance hanging
- Always use `--env-file .env.production` to pass environment variables
- Frontend: http://YOUR_EC2_IP
- Backend: http://YOUR_EC2_IP:8080
