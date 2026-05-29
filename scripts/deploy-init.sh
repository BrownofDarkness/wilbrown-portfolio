#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Deploy init for wilbrown-innova.com portfolio
# Idempotent: safe to re-run (skips steps already done).
#
# Usage from the repo root:
#   bash scripts/deploy-init.sh
# ─────────────────────────────────────────────────────────────────────

set -euo pipefail

# Move to repo root regardless of where this is invoked from
cd "$(dirname "$0")/.."

C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_RED='\033[0;31m'
C_CYAN='\033[0;36m'
C_RESET='\033[0m'

ok()   { echo -e "${C_GREEN}✓${C_RESET} $*"; }
info() { echo -e "${C_CYAN}ℹ${C_RESET} $*"; }
warn() { echo -e "${C_YELLOW}⚠${C_RESET} $*"; }
fail() { echo -e "${C_RED}✗${C_RESET} $*" >&2; exit 1; }

echo ""
echo -e "${C_CYAN}▶ Portfolio deploy init — wilbrown-innova.com${C_RESET}"
echo ""

# ─── 1. Pre-flight ───────────────────────────────────────────────────

[ -f package.json ] || fail "package.json not found. Run from repo root."
[ -f .env.example ] || fail ".env.example not found."

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node.js >= 20 required (you have v${NODE_MAJOR}.x). Install Node 22:
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs build-essential python3"
fi
ok "Node.js v$(node -v | sed 's/v//')"

if ! command -v pm2 >/dev/null 2>&1; then
  warn "PM2 not installed — installing globally"
  sudo npm install -g pm2
fi
ok "PM2 v$(pm2 -v)"
echo ""

# ─── 2. .env.local setup ─────────────────────────────────────────────

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  ok "Created .env.local from .env.example"
else
  info ".env.local already exists — keeping it"
fi
echo ""

# ─── 3. AUTH_SECRET ──────────────────────────────────────────────────

if grep -qE '^AUTH_SECRET=.{32,}' .env.local; then
  info "AUTH_SECRET already set in .env.local"
else
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  if grep -qE '^AUTH_SECRET=' .env.local; then
    sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=$SECRET|" .env.local
  else
    echo "AUTH_SECRET=$SECRET" >> .env.local
  fi
  ok "AUTH_SECRET generated and written to .env.local"
fi
echo ""

# ─── 4. RESEND_API_KEY ───────────────────────────────────────────────

CURRENT_RESEND=$(grep -E '^RESEND_API_KEY=' .env.local | sed 's/^RESEND_API_KEY=//' || true)
if [ -z "${CURRENT_RESEND:-}" ]; then
  echo "Resend API key for the contact form."
  echo "Paste it, or hit Enter to skip (form will dry-run to logs):"
  read -rp "> " RESEND_KEY || RESEND_KEY=""
  if [ -n "${RESEND_KEY:-}" ]; then
    sed -i "s|^RESEND_API_KEY=.*|RESEND_API_KEY=$RESEND_KEY|" .env.local
    ok "RESEND_API_KEY set"
  else
    warn "Skipped — contact form will dry-run (log only, no email)"
  fi
else
  info "RESEND_API_KEY already set — keeping it"
fi
echo ""

# ─── 5. Install deps ─────────────────────────────────────────────────
# Must run BEFORE the password hash step — that script imports bcryptjs
# which only exists after npm ci puts it in node_modules.

echo -e "${C_CYAN}▶ npm ci${C_RESET} — may take a few minutes for native deps (better-sqlite3, sharp)"
npm ci
ok "Dependencies installed"
echo ""

# ─── 6. Admin password hash ──────────────────────────────────────────

if [ -f .auth/password.hash ] && [ -s .auth/password.hash ]; then
  info ".auth/password.hash already exists — keeping it"
  echo "  (delete it manually if you want to set a new password)"
else
  echo -e "${C_CYAN}Admin password${C_RESET} — used to log into /admin/login."
  echo "Choose something strong (12+ chars, mix letters/numbers/symbols)."
  npm run hash
fi
echo ""

# ─── 7. Production build ─────────────────────────────────────────────

echo -e "${C_CYAN}▶ npm run build${C_RESET}"
npm run build
ok "Build complete"
echo ""

# ─── 8. PM2 start / reload ───────────────────────────────────────────

APP_NAME="portfolio"
if pm2 list 2>/dev/null | grep -qw "$APP_NAME"; then
  echo -e "${C_CYAN}▶ PM2 process '${APP_NAME}' exists — reloading${C_RESET}"
  pm2 reload "$APP_NAME"
else
  echo -e "${C_CYAN}▶ Starting PM2 process '${APP_NAME}' on port 3000${C_RESET}"
  pm2 start npm --name "$APP_NAME" -- start
fi

pm2 save
ok "PM2 process saved"
echo ""

# ─── 9. Smoke test ───────────────────────────────────────────────────

echo -e "${C_CYAN}▶ Smoke test: curl -I http://localhost:3000${C_RESET}"
sleep 2  # let Next.js bind
if curl -I -s --max-time 5 http://localhost:3000 | head -1 | grep -qE 'HTTP/1\.[01] (200|307|308)'; then
  ok "App responding on port 3000"
else
  warn "App not responding yet. Check logs:  pm2 logs portfolio"
fi

# ─── 10. Next steps ──────────────────────────────────────────────────

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${C_GREEN} Deploy init complete.${C_RESET} What's next:"
echo ""
echo "  1. PM2 boot hook (one-time):"
echo "       pm2 startup"
echo "     → paste the printed sudo command back into the shell"
echo ""
echo "  2. nginx config (template in scripts/nginx-wilbrown-innova.conf):"
echo "       sudo cp scripts/nginx-wilbrown-innova.conf \\"
echo "         /etc/nginx/sites-available/wilbrown-innova.com"
echo "       sudo ln -s /etc/nginx/sites-available/wilbrown-innova.com \\"
echo "         /etc/nginx/sites-enabled/"
echo "       sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "  3. Cloudflare Tunnel public hostname:"
echo "       wilbrown-innova.com  →  http://localhost:80"
echo ""
echo "  Logs:     pm2 logs portfolio"
echo "  Restart:  pm2 restart portfolio"
echo "  Status:   pm2 status"
echo "════════════════════════════════════════════════════════════════"
