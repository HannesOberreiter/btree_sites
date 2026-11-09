#!/usr/bin/env bash
# Start the b.tree app with demo data on localhost for screenshots.
# Usage: scripts/screenshots/start-app.sh <path to a btree checkout>
# Starts fresh MariaDB and Redis containers (shots-mariadb, shots-redis),
# builds and starts the server on port 8102 and serves the web app on port 9000.
# Every run drops the database and loads the demo seed again.
set -euo pipefail

BTREE_DIR=$(cd "${1:?usage: start-app.sh <path to btree checkout>}" && pwd)
LOG_DIR=${SHOTS_LOG_DIR:-${TMPDIR:-/tmp}/btree-shots}
mkdir -p "$LOG_DIR"

# TZ=UTC as in the server container. Some date logic gives wrong results in other time zones.
export TZ=UTC ENVIRONMENT=ci NODE_ENV=ci DB_PORT=33081 REDIS_PORT=63801 AUTHORIZED=http://localhost:9000

"$(dirname "$0")/stop-app.sh" >/dev/null 2>&1 || true

docker run -d --name shots-mariadb -e MARIADB_ROOT_PASSWORD=root -e MARIADB_DATABASE=ci_test -p 33081:3306 mariadb:lts >/dev/null
docker run -d --name shots-redis -p 63801:6379 redis >/dev/null

cd "$BTREE_DIR/apps/server"
echo "Building the server"
pnpm install --frozen-lockfile >"$LOG_DIR/server-install.log" 2>&1
pnpm run build >"$LOG_DIR/server-build.log" 2>&1

for _ in $(seq 1 60); do
  docker exec shots-mariadb healthcheck.sh --connect --innodb_initialized >/dev/null 2>&1 && break
  sleep 1
done
echo "Loading the demo data"
(pnpm run migrate && pnpm exec knex seed:run) >"$LOG_DIR/seed.log" 2>&1

nohup node dist/app.bootstrap.js >"$LOG_DIR/server.log" 2>&1 &
echo $! >"$LOG_DIR/server.pid"
for _ in $(seq 1 30); do
  curl -sf -o /dev/null http://localhost:8102/api/v1/openapi.json && break
  sleep 1
done

cd "$BTREE_DIR/apps/web"
echo "Building the web app"
pnpm install --frozen-lockfile >"$LOG_DIR/web-install.log" 2>&1
pnpm --dir src-pwa install --frozen-lockfile >"$LOG_DIR/pwa-install.log" 2>&1
# BRANCH=dev allows API calls to localhost. Matomo needs dummy values or the app does not boot.
BRANCH=dev BACKEND_URL=http://localhost:8102/api MATOMO_HOST=http://localhost:9999 MATOMO_SITE_ID=1 \
  ./node_modules/.bin/quasar build >"$LOG_DIR/web-build.log" 2>&1
nohup ./node_modules/.bin/vite preview --outDir dist/spa --port 9000 --strictPort >"$LOG_DIR/web.log" 2>&1 &
echo $! >"$LOG_DIR/web.pid"
for _ in $(seq 1 20); do
  curl -sf -o /dev/null http://localhost:9000/ && echo "App runs on http://localhost:9000" && exit 0
  sleep 1
done
echo "Web app did not start, see $LOG_DIR/web.log" >&2
exit 1
