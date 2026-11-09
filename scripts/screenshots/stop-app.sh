#!/usr/bin/env bash
# Stop the app that start-app.sh started and remove its containers.
LOG_DIR=${SHOTS_LOG_DIR:-${TMPDIR:-/tmp}/btree-shots}
for pid_file in "$LOG_DIR/server.pid" "$LOG_DIR/web.pid"; do
  [ -f "$pid_file" ] && kill "$(cat "$pid_file")" 2>/dev/null
  rm -f "$pid_file"
done
docker rm -f shots-mariadb shots-redis >/dev/null 2>&1
exit 0
