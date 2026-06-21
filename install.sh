#!/usr/bin/env bash
set -euo pipefail

# Tx Doctor skill installer.
# Installs into ~/.claude/skills/tx-doctor and optionally fetches the core
# solana-dev skill. Does NOT overwrite your global ~/.claude/CLAUDE.md.

YES=0
AGENTS=0
SKILLS_DIR="${HOME}/.claude/skills"

C_RESET=$'\033[0m'; C_CYAN=$'\033[36m'; C_GREEN=$'\033[32m'; C_YELLOW=$'\033[33m'

print_banner() {
  printf '%s' "$C_CYAN"
  cat <<'BANNER'
  ┌────────────────────────────────────────┐
  │   T X   D O C T O R                     │
  │   Solana transaction lifecycle skill    │
  └────────────────────────────────────────┘
BANNER
  printf '%s' "$C_RESET"
}

print_help() {
  cat <<'HELP'
Usage: ./install.sh [options]

  -y, --yes      Non-interactive (assume yes)
      --agents   Also emit AGENTS.md for Codex/other agents
      --dir DIR  Install into DIR (default: ~/.claude/skills)
  -h, --help     Show this help

Installs the Tx Doctor skill into ~/.claude/skills/tx-doctor.
HELP
}

while [ $# -gt 0 ]; do
  case "$1" in
    -y|--yes) YES=1 ;;
    --agents) AGENTS=1 ;;
    --dir) SKILLS_DIR="$2"; shift ;;
    -h|--help) print_help; exit 0 ;;
    *) echo "Unknown option: $1" >&2; print_help; exit 1 ;;
  esac
  shift
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${SKILLS_DIR}/tx-doctor"

print_banner
echo "Install target: ${DEST}"

if [ "$YES" -ne 1 ]; then
  printf "Proceed? [y/N] "
  read -r reply
  case "$reply" in y|Y|yes|YES) ;; *) echo "Aborted."; exit 0 ;; esac
fi

mkdir -p "$DEST"

# Copy skill contents (preserve structure).
for item in skill agents commands rules scripts package.json tsconfig.json vitest.config.ts README.md LICENSE; do
  if [ -e "${SCRIPT_DIR}/${item}" ]; then
    cp -R "${SCRIPT_DIR}/${item}" "${DEST}/"
  fi
done
echo "${C_GREEN}✓${C_RESET} Copied skill files."

# Optionally fetch the core solana-dev skill (dependency for general dev).
CORE="${SKILLS_DIR}/solana-dev"
if [ ! -d "$CORE" ]; then
  if command -v git >/dev/null 2>&1; then
    echo "Fetching core solana-dev skill..."
    git clone --depth 1 https://github.com/solana-foundation/solana-dev-skill "$CORE" 2>/dev/null \
      && echo "${C_GREEN}✓${C_RESET} Installed solana-dev." \
      || echo "${C_YELLOW}!${C_RESET} Could not clone solana-dev (optional); skipping."
  fi
fi

if [ "$AGENTS" -eq 1 ]; then
  cat > "${DEST}/AGENTS.md" <<'AGENTS_MD'
# Tx Doctor (agents)

Solana transaction-lifecycle skill. Entry point: skill/SKILL.md (symptom-first
routing). CLIs in scripts/ decode errors, simulate, estimate fees, inspect txs.
Build with `npm install` (also builds), then `node dist/tx-doctor.js <command>`.
AGENTS_MD
  echo "${C_GREEN}✓${C_RESET} Wrote AGENTS.md."
fi

cat <<EOF

${C_GREEN}Tx Doctor installed.${C_RESET}

Build the CLI:
  cd "${DEST}" && npm install   # also builds

Try it:
  node dist/tx-doctor.js decode 0x1771
  node dist/tx-doctor.js fee --cluster devnet

Use in Claude Code:
  - Skill hub:  skill/SKILL.md  (symptom → module routing)
  - Agent:      @tx-doctor
  - Commands:   /diagnose-tx  /decode-error  /optimize-fees  /preflight
EOF
