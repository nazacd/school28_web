#!/usr/bin/env bash
# Pulls the newest image from Docker Hub and restarts the site.
# Run by GitHub Actions over SSH after every push to main (see README → Deployment),
# and safe to run by hand: /opt/school28/deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

docker compose pull web
docker compose up -d --remove-orphans web

# Wait for the container's health check (up to ~60 s).
for _ in $(seq 30); do
  status=$(docker inspect --format '{{.State.Health.Status}}' school28-web 2>/dev/null || echo starting)
  if [ "$status" = "healthy" ]; then
    echo "school28-web is healthy"
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done

echo "school28-web did not become healthy; recent logs:" >&2
docker logs --tail 50 school28-web >&2
exit 1
