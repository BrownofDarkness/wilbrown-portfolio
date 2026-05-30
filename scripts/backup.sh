#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Daily backup for the portfolio:
#   - SQLite DB (data/portfolio.db) — WAL-safe via sqlite3 .backup
#   - Uploads (public/{showcase,events}/uploads/) — daily tarballs
#
# Rotates: keeps the last 30 days of both, prunes older silently.
#
# Cron entry (daily at 03:30):
#   30 3 * * * /var/www/wilbrown-portfolio/scripts/backup.sh \
#              >> /var/log/portfolio-backup.log 2>&1
#
# Off-site mirror (optional, later): pipe BACKUP_DIR to rclone, restic,
# or rsync to a remote (S3, B2, another VPS). For now it's a single-disk
# safety net against accidental rm / admin oopsies.
# ─────────────────────────────────────────────────────────────────────

set -euo pipefail

REPO_DIR="${REPO_DIR:-/var/www/wilbrown-portfolio}"
# Default to user-local backups under $HOME so the cron entry doesn't need
# sudo. Override with env var if you want /var/backups/portfolio (sudo)
# or a remote/mounted path.
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/portfolio}"
KEEP_DAYS="${KEEP_DAYS:-30}"

DATE=$(date +%Y-%m-%d_%H%M)
DB_SRC="$REPO_DIR/data/portfolio.db"

# Pre-flight
[ -d "$REPO_DIR" ] || { echo "✗ Repo not found at $REPO_DIR"; exit 1; }
[ -f "$DB_SRC" ]  || { echo "✗ DB not found at $DB_SRC"; exit 1; }
command -v sqlite3 >/dev/null || { echo "✗ sqlite3 not installed. Run: sudo apt install -y sqlite3"; exit 1; }

mkdir -p "$BACKUP_DIR/db" "$BACKUP_DIR/uploads"

# ─── DB backup ───────────────────────────────────────────────────────
# 'sqlite3 .backup' is safe with WAL mode — it copies a consistent
# snapshot without locking writers out. Then we gzip for storage.
DB_OUT="$BACKUP_DIR/db/portfolio-$DATE.db"
sqlite3 "$DB_SRC" ".backup '$DB_OUT'"
gzip -f "$DB_OUT"
echo "[$(date '+%F %T')] DB    backed up → ${DB_OUT}.gz  ($(du -h "${DB_OUT}.gz" | cut -f1))"

# ─── Uploads backup ──────────────────────────────────────────────────
# Tarball with date suffix — each backup is self-contained, no
# rsync --delete weirdness if files get removed via admin.
UPLOADS_OUT="$BACKUP_DIR/uploads/uploads-$DATE.tar.gz"
tar czf "$UPLOADS_OUT" \
    -C "$REPO_DIR" \
    --ignore-failed-read \
    public/showcase/uploads \
    public/events/uploads 2>/dev/null || true
echo "[$(date '+%F %T')] Files backed up → $UPLOADS_OUT  ($(du -h "$UPLOADS_OUT" | cut -f1))"

# ─── Rotation ────────────────────────────────────────────────────────
find "$BACKUP_DIR/db"      -name "portfolio-*.db.gz"    -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR/uploads" -name "uploads-*.tar.gz"     -mtime +"$KEEP_DAYS" -delete

echo "[$(date '+%F %T')] Rotation done (kept last $KEEP_DAYS days)"
